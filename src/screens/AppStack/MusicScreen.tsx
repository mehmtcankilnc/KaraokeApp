import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RecordingOptions,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import { LyricItem } from "../../components/LyricItem";
import { ChevronLeft, Pause, Play, Square } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReturnCode } from "@wokcito/ffmpeg-kit-react-native";
import { File, Paths } from "expo-file-system";
import { Asset } from "expo-asset";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/navigation.types";
import { DeviceType, FFmpegInput, Lyric } from "../../types/types";
import { useModal } from "../../hooks/useModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { getCurrentDeviceType } from "../../../modules/audio-device";
import { AUDIO_LATENCY_MAP } from "../../constants/constants";
import { executeFFmpeg } from "../../utilities/executeFfmpeg";

export default function MusicScreen() {
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);

  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "Music">>();
  const { music } = route.params;

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { showStatusModal } = useModal();

  const getAndroidAudioSource = (type: DeviceType | null) => {
    switch (type) {
      case "speaker":
        return "mic";
      case "bluetooth":
      case "wired":
        return "voice_performance";
      default:
        return "default";
    }
  };

  const recorderOptions = useMemo<RecordingOptions>(() => {
    return {
      ...RecordingPresets.HIGH_QUALITY,
      android: {
        audioEncoder: "aac",
        audioSource: getAndroidAudioSource(deviceType),
        outputFormat: "mpeg4",
      },
    };
  }, [deviceType]);

  const player = useAudioPlayer(music.songPath);
  const recorder = useAudioRecorder(recorderOptions);

  const lastScrolledIndexRef = useRef<number>(-1);
  const isFinishingRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(player.playing);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isMixing, setIsMixing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const currentDeviceType = await getCurrentDeviceType();
      if (isMounted) {
        setDeviceType(currentDeviceType);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!deviceType || !recorder) return;

    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        if (isMounted) {
          await recorder.prepareToRecordAsync();
          recorder.record();
          player.play();
          setIsPlaying(true);
        }
      } catch (e) {
        console.log("Ses başlatılırken hata oluştu: ", e);
      }
    })();

    return () => {
      isMounted = false;
      setIsPlaying(false);
    };
  }, [deviceType]);

  const latencyMs = AUDIO_LATENCY_MAP[deviceType!] || 100;

  const handlePause = () => {
    player.pause();
    recorder.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    isFinishingRef.current = false;
    player.play();
    recorder.record();
    setIsPlaying(true);
  };

  const handleStop = async () => {
    try {
      isFinishingRef.current = true;
      const playedDuration = player.currentTime;
      player.pause();
      setIsPlaying(false);

      if (recorder) {
        await recorder.stop();
      }

      if (recorder.uri) {
        setIsMixing(true);
        try {
          let finalSongPath = music.songPath;
          if (typeof music.songPath === "number") {
            const asset = Asset.fromModule(music.songPath);
            if (!asset.localUri) {
              try {
                await asset.downloadAsync();
              } catch (err) {
                console.log("Asset cihaz önbelleğine alınamadı: ", err);
              }
            }

            finalSongPath = asset.localUri || asset.uri;
          }

          const outputFile = new File(
            Paths.document,
            `mixed_${Date.now()}.m4a`,
          );

          let vocalVolume = deviceType === "bluetooth" ? "7.0" : "5.0";

          // const command = `-i "${recorder.uri}" -i "${finalSongPath}" -filter_complex "[0:a]atrim=start=${latencyMs / 1000},asetpts=PTS-STARTPTS,volume=${vocalVolume}[vocal];[1:a]volume=0.05[bg];[vocal][bg]amix=inputs=2:duration=longest[mixout];[mixout]volume=1.5" -t ${playedDuration} "${outputFile.uri}"`;

          // const session = await FFmpegKit.execute(command);
          const ffmpegInput: FFmpegInput = {
            recorderUri: recorder.uri,
            songPath: finalSongPath,
            latencyMs: latencyMs,
            vocalVolume: vocalVolume,
            playedDuration: playedDuration,
            outputUri: outputFile.uri,
          };

          const session = await executeFFmpeg(ffmpegInput);

          const returnCode = await session.getReturnCode();

          if (ReturnCode.isSuccess(returnCode)) {
            navigation.navigate("Success", {
              vocalUri: recorder.uri,
              mixedUri: outputFile.uri,
              ffmpegInput: ffmpegInput,
            });
          } else {
            const failLogs = await session.getLogs();
            showStatusModal({
              type: "error",
              title: "Hata",
              message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            });
            console.log(
              "FFmpeg komutu başarısız sonuçlandı. Loglar:",
              failLogs,
            );
          }
        } catch (ffmpegError) {
          showStatusModal({
            type: "error",
            title: "Hata",
            message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          });
          console.log("FFmpeg komutu çalıştırılamadı: ", ffmpegError);
        } finally {
          setIsMixing(false);
        }
      }
    } catch (error) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
      console.log("Bilinmeyen bir hata oluştu: ", error);
    } finally {
      setIsMixing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.playing) {
        const currentMs = player.currentTime * 1000;
        setActiveSeconds(currentMs);

        const index = music.lyrics.findIndex(
          (l: Lyric) => currentMs >= l.startTime && currentMs <= l.endTime,
        );

        if (index !== -1 && index !== lastScrolledIndexRef.current) {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });

          lastScrolledIndexRef.current = index;
        }
      }

      if (
        player &&
        player.duration > 0 &&
        player.currentTime >= player.duration - 0.2
      ) {
        if (!isFinishingRef.current) {
          isFinishingRef.current = true;
          handleStop();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player.playing, music.lyrics]);

  return (
    <View className="flex-1 bg-[#fee9e6]">
      {/** Back Button */}
      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute left-3 z-10"
        style={{ top: insets.top + 10 }}
      >
        <ChevronLeft color={"#ffffff"} size={32} />
      </Pressable>
      {/** Header */}
      <View
        className="bg-[#131e29]"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            color: "#fee9e6",
            fontSize: 24,
            lineHeight: 36,
            fontWeight: 600,
            alignSelf: "center",
          }}
        >
          {music.title}
        </Text>
      </View>
      {/** Lyrics */}
      <FlatList
        ref={flatListRef}
        data={music.lyrics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Lyric }) => (
          <LyricItem item={item} currentTime={activeSeconds} />
        )}
        getItemLayout={(_, index) => ({
          length: 50,
          offset: 50 * index,
          index,
        })}
      />
      {/** Footer */}
      <View
        className="flex-row justify-center items-center bg-[#131e29]"
        style={{
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        }}
      >
        <Pressable
          style={{ width: "50%" }}
          className="items-center"
          onPress={isPlaying ? handlePause : handleResume}
        >
          {isPlaying ? <Pause color={"#ffffff"} /> : <Play color={"#ffffff"} />}
          <Text
            style={{
              color: "#fee9e6",
              fontSize: 12,
              lineHeight: 18,
              fontWeight: 500,
              alignSelf: "center",
            }}
          >
            {isPlaying ? "Durdur" : "Devam Et"}
          </Text>
        </Pressable>
        <Pressable
          className="items-center"
          style={{ width: "50%" }}
          onPress={handleStop}
        >
          <Square color={"#ffffff"} />
          <Text
            style={{
              color: "#fee9e6",
              fontSize: 12,
              lineHeight: 18,
              fontWeight: 500,
              alignSelf: "center",
            }}
          >
            Bitir
          </Text>
        </Pressable>
      </View>
      {/** Loading */}
      {isMixing && (
        <View
          className="absolute inset-0 z-50 justify-center items-center bg-black/60"
          style={{ height: "100%", width: "100%" }}
        >
          <ActivityIndicator size="large" color="#fee9e6" />
          <Text
            style={{
              color: "#fee9e6",
              marginTop: 12,
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Sesler Birleştiriliyor...
          </Text>
        </View>
      )}
    </View>
  );
}
