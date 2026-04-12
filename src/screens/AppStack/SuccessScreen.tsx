import {
  View,
  Text,
  Linking,
  Pressable,
  BackHandler,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/navigation.types";
import { useModal } from "../../hooks/useModal";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { CheckCheck, Download, Pause, Play, Share2 } from "lucide-react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import Slider from "@react-native-community/slider";
import { FFmpegInput } from "../../types/types";
import { executeFFmpeg } from "../../utilities/executeFfmpeg";
import { ReturnCode } from "@wokcito/ffmpeg-kit-react-native";
import { Paths, File } from "expo-file-system";
import {
  MAX_LATENCY,
  MIN_LATENCY,
  STEP_QUANTITY,
} from "../../constants/constants";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

export default function SuccessScreen() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "Success">>();
  const { vocalUri, mixedUri, ffmpegInput } = route.params;
  const insets = useSafeAreaInsets();

  const { showStatusModal, showActionModal } = useModal();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [customLatencyValue, setCustomLatencyValue] = useState<number>(
    ffmpegInput.latencyMs,
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [newMixedUri, setNewMixedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const player = useAudioPlayer(newMixedUri);

  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.replace("Home");
      return true;
    });

    player.addListener("playbackStatusUpdate", (status) => {
      if (status.isLoaded) {
        if (status.didJustFinish && !status.loop) {
          setIsPlaying(false);
          player.pause();
          player.seekTo(0);
        }
      }
    });

    return () => backSub.remove();
  }, [player]);

  const handleShare = async (uri?: string | null, title?: string) => {
    if (!uri) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message: "Ses dosyası henüz hazır değil veya bulunamadı.",
      });
      console.log("Ses dosyası henüz hazır değil veya bulunamadı.");
      return;
    }

    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: title,
          mimeType: "audio/m4a",
        });
      } else {
        showStatusModal({
          type: "error",
          title: "Hata",
          message: "Bu cihazda paylaşım desteklenmiyor.",
        });
        console.log("Bu cihazda paylaşım desteklenmiyor.");
      }
    } catch (error) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message:
          "Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
      console.log("Paylaşırken bilinmeyen bir hata oluştu: ", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async (uri?: string | null) => {
    if (!uri) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message: "Ses dosyası henüz hazır değil veya bulunamadı.",
      });
      console.log("Ses dosyası henüz hazır değil veya bulunamadı.");
      return;
    }

    try {
      const status = await MediaLibrary.requestPermissionsAsync();

      if (!status.granted && !status.canAskAgain) {
        showActionModal({
          title: "İzin Reddedildi",
          message:
            "Ses dosyalarını kaydedebilmek için medya izni gereklidir. Lütfen ayarlardan izni açın.",
          confirmText: "Ayarlara Git",
          onConfirm: () => Linking.openSettings(),
        });
        return;
      }

      await MediaLibrary.createAssetAsync(uri);

      setTimeout(() => {
        showStatusModal({
          type: "success",
          title: "İndirme Tamamlandı",
          message: "Ses kaydı cihazınıza başarıyla kaydedildi.",
        });
      }, 500);
    } catch (error) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message:
          "Dosya kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
      console.log("Dosya kaydedilirken bir hata oluştu: ", error);
    }
  };

  const handleExecuteAgain = async () => {
    try {
      if (isExecuting) return;

      setIsExecuting(true);
      const outputFile = new File(Paths.document, `mixed_${Date.now()}.m4a`);

      const newInput: FFmpegInput = {
        recorderUri: ffmpegInput.recorderUri,
        songPath: ffmpegInput.songPath,
        latencyMs: customLatencyValue,
        vocalVolume: ffmpegInput.vocalVolume,
        playedDuration: ffmpegInput.playedDuration,
        outputUri: outputFile.uri,
      };

      const session = await executeFFmpeg(newInput);

      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        setNewMixedUri(outputFile.uri);
      } else {
        showStatusModal({
          type: "error",
          title: "Hata",
          message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        });
        console.log("FFmpeg komutu başarısız sonuçlandı.");
      }
    } catch (error) {
      console.log(
        "FFmpeg komutunu tekrar çalıştırırken bir hata oluştu: ",
        error,
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePlay = async () => {
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message:
          "Ses başlatılırken hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
      console.log("Ses başlatılırken hata oluştu: ", e);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#131e29]"
      contentContainerStyle={{ gap: wp(5), padding: wp(5) }}
    >
      {/** Title */}
      <Text
        style={{
          color: "#fff",
          fontSize: 30,
          fontWeight: 800,
          alignSelf: "center",
          paddingTop: insets.top + 8,
        }}
      >
        Şarkın Hazır
      </Text>
      {/** First Results */}
      <View
        className="w-full bg-[#fee9e6] rounded-xl justify-between items-center"
        style={{
          padding: wp(4),
        }}
      >
        {/** Buttons */}
        <View className="w-full" style={{ rowGap: wp(8), marginTop: wp(2) }}>
          {mixedUri && (
            <View className="w-full" style={{ rowGap: wp(4) }}>
              <Text className="text-[#131e29] font-bold text-sm">
                🎵 Karaoke Mix
              </Text>
              <View className="flex-row" style={{ columnGap: wp(4) }}>
                <Pressable
                  onPress={() =>
                    handleShare(mixedUri, "Karaoke Kaydını Paylaş")
                  }
                  style={{ padding: wp(2), columnGap: wp(3) }}
                  className="flex-1 bg-[#131e29] rounded-xl flex-row justify-center items-center"
                >
                  <Share2 color="#fee9e6" size={18} />
                  <Text className="text-[#fee9e6] font-semibold text-sm">
                    Paylaş
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDownload(mixedUri)}
                  style={{ padding: wp(2), columnGap: wp(3) }}
                  className="flex-1 bg-[#f97362] rounded-xl flex-row justify-center items-center"
                >
                  <Download color="#fee9e6" size={18} />
                  <Text className="text-[#fee9e6] font-semibold text-sm">
                    İndir
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          {vocalUri && (
            <View className="w-full" style={{ rowGap: wp(4) }}>
              <Text className="text-[#131e29] font-bold text-sm">
                🎤 Sadece Vokal
              </Text>
              <View className="flex-row" style={{ columnGap: wp(4) }}>
                <Pressable
                  onPress={() => handleShare(vocalUri, "Vokal Kaydını Paylaş")}
                  style={{ padding: wp(2), columnGap: wp(3) }}
                  className="flex-1 bg-[#131e29] rounded-xl flex-row justify-center items-center"
                >
                  <Share2 color="#fee9e6" size={18} />
                  <Text className="text-[#fee9e6] font-semibold text-sm">
                    Paylaş
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDownload(vocalUri)}
                  style={{ padding: wp(2), columnGap: wp(3) }}
                  className="flex-1 bg-[#f97362] rounded-xl flex-row justify-center items-center"
                >
                  <Download color="#fee9e6" size={18} />
                  <Text className="text-[#fee9e6] font-semibold text-sm">
                    İndir
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
      {/** Edit Section */}
      <View
        className="w-full bg-[#fee9e6] rounded-xl"
        style={{
          padding: wp(4),
        }}
      >
        <Text
          style={{
            color: "#131e29",
            fontSize: 14,
            fontWeight: 400,
            alignSelf: "center",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Ses kaydınız başarıyla oluşturulmuştur. Yukarıdaki butonlar
          aracılığıyla oluşturulan kayıtları indirebilirsiniz. Ayrıca gecikmeyi
          dengelemek için alttaki ses ayar çubuğunu kullanabilirsiniz.
        </Text>
        <View className="flex-row w-full justify-between items-center">
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={MIN_LATENCY}
            maximumValue={MAX_LATENCY}
            value={customLatencyValue}
            step={STEP_QUANTITY}
            onValueChange={(val) =>
              setCustomLatencyValue(Number(val.toFixed(1)))
            }
            minimumTrackTintColor="#131e29"
            maximumTrackTintColor="#000000"
            thumbSize={16}
            thumbTintColor="#f97362"
          />
          <Text className="text-[#131e29] font-bold text-sm">
            {customLatencyValue} ms
          </Text>
          <Pressable
            onPress={handleExecuteAgain}
            disabled={
              isExecuting || customLatencyValue === ffmpegInput.latencyMs
            }
            className="bg-[#131e29] rounded-lg items-center justify-center"
            style={{
              padding: wp(3),
              opacity: customLatencyValue === ffmpegInput.latencyMs ? 0.5 : 1,
            }}
          >
            {isExecuting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <CheckCheck color={"#ffffff"} />
            )}
          </Pressable>
        </View>
        {/** New Results */}
        {newMixedUri && (
          <View className="w-full" style={{ rowGap: wp(4), marginTop: wp(4) }}>
            <Text className="text-[#131e29] font-bold text-sm">
              🎵 Güncellenmiş Mix
            </Text>
            <View className="flex-row" style={{ columnGap: wp(4) }}>
              <Pressable
                onPress={async () => await handlePlay()}
                style={{ padding: wp(2), columnGap: wp(3) }}
                className="flex-1 bg-[#d1d1d1] rounded-xl flex-row justify-center items-center"
              >
                {isPlaying ? (
                  <Pause color="#131e29" size={18} />
                ) : (
                  <Play color="#131e29" size={18} />
                )}
                <Text className="text-[#131e29] font-semibold text-sm">
                  {isPlaying ? "Durdur" : "Oynat"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleShare(newMixedUri, "Vokal Kaydını Paylaş")}
                style={{ padding: wp(2), columnGap: wp(3) }}
                className="flex-1 bg-[#131e29] rounded-xl flex-row justify-center items-center"
              >
                <Share2 color="#fee9e6" size={18} />
                <Text className="text-[#fee9e6] font-semibold text-sm">
                  Paylaş
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleDownload(newMixedUri)}
                style={{ padding: wp(2), columnGap: wp(3) }}
                className="flex-1 bg-[#f97362] rounded-xl flex-row justify-center items-center"
              >
                <Download color="#fee9e6" size={18} />
                <Text className="text-[#fee9e6] font-semibold text-sm">
                  İndir
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
      {/** Homepage Button */}
      <Pressable
        className="w-full bg-[#fee9e6] rounded-xl items-center justify-between"
        style={{
          padding: wp(4),
        }}
        onPress={() => navigation.replace("Home")}
      >
        <Text className="text-[#131e29] font-bold text-lg">Ana Sayfa</Text>
      </Pressable>
    </ScrollView>
  );
}
