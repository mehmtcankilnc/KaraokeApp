import { View, Text, Linking, Pressable, BackHandler } from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/navigation.types";
import { useModal } from "../../hooks/useModal";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Download, Share2 } from "lucide-react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";

export default function SuccessScreen() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "Success">>();
  const { vocalUri, mixedUri } = route.params;
  const insets = useSafeAreaInsets();

  const { showStatusModal, showActionModal } = useModal();
  const [isDownloading, setIsDownloading] = useState(false);

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
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
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

      showStatusModal({
        type: "success",
        title: "İndirme Tamamlandı",
        message: "Ses kaydı cihazınıza başarıyla kaydedildi.",
      });
    } catch (error) {
      showStatusModal({
        type: "error",
        title: "Hata",
        message:
          "Dosya kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      });
      console.log("Dosya kaydedilirken bir hata oluştu: ", error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.replace("Home");
      return true;
    });

    return () => sub.remove();
  }, []);

  return (
    <View
      className="flex-1 bg-[#131e29]"
      style={{ padding: wp(5), gap: wp(5) }}
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
    </View>
  );
}
