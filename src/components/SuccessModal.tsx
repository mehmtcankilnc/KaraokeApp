import { View, Text, Pressable, Modal } from "react-native";
import React, { useState } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Share2, Download } from "lucide-react-native";
import CustomAlert from "./CustomAlert";

type Props = {
  visible: boolean;
  handleDismiss: () => void;
  vocalUri?: string | null;
  mixedUri?: string | null;
};

export default function SuccessModal({
  visible,
  handleDismiss,
  vocalUri,
  mixedUri,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<"success" | "failure">("failure");

  const handleShare = async (uri?: string | null, title?: string) => {
    if (!uri) {
      setAlertTitle("Hata!");
      setAlertText("Ses dosyası henüz hazır değil veya bulunamadı.");
      setAlertVisible(true);
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
        setAlertTitle("Hata!");
        setAlertText("Bu cihazda paylaşım desteklenmiyor.");
        setAlertVisible(true);
      }
    } catch (error) {
      setAlertTitle("Hata!");
      setAlertText(
        "Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
      setAlertVisible(true);
    }
  };

  const handleDownload = async (uri?: string | null) => {
    if (!uri) {
      setAlertTitle("Hata!");
      setAlertText("Ses dosyası henüz hazır değil veya bulunamadı.");
      setAlertVisible(true);
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        setAlertTitle("İzin Reddedildi!");
        setAlertText(
          "Ses dosyalarını kaydedebilmek için medya izni gereklidir.",
        );
        setAlertVisible(true);
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);

      try {
        const album = await MediaLibrary.getAlbumAsync("Karaoke Kayıtları");
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync(
            "Karaoke Kayıtları",
            asset,
            false,
          );
        }
      } catch (albumError) {}

      setAlertTitle("İndirme Tamamlandı!");
      setAlertText("Ses kaydı cihazınıza başarıyla kaydedildi!");
      setAlertType("success");
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Hata!");
      setAlertText(
        "Dosya kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
      setAlertVisible(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleDismiss}
      transparent
      animationType="fade"
    >
      <Pressable
        onPress={handleDismiss}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Pressable
          className="bg-white items-center rounded-2xl"
          style={{ width: wp(90), paddingVertical: 24, paddingHorizontal: 16 }}
        >
          {/** Title */}
          <Text
            style={{
              color: "#131e29",
              fontSize: 24,
              fontWeight: 800,
              alignSelf: "center",
              marginBottom: 8,
            }}
          >
            Başarılı
          </Text>
          {/** Text */}
          <Text
            style={{
              color: "#131e29",
              fontSize: 16,
              fontWeight: 400,
              alignSelf: "center",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Karaoke kaydınız başarıyla oluşturulmuştur.
          </Text>
          {/** Action Buttons */}
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
                    onPress={() =>
                      handleShare(vocalUri, "Vokal Kaydını Paylaş")
                    }
                    style={{ padding: wp(2), columnGap: wp(3) }}
                    className="flex-1 bg-gray-200 rounded-xl flex-row justify-center items-center"
                  >
                    <Share2 color="#131e29" size={18} />
                    <Text className="text-[#131e29] font-semibold text-sm">
                      Paylaş
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDownload(vocalUri)}
                    style={{ padding: wp(2), columnGap: wp(3) }}
                    className="flex-1 border border-gray-300 bg-gray-50 rounded-xl flex-row justify-center items-center"
                  >
                    <Download color="#131e29" size={18} />
                    <Text className="text-[#131e29] font-semibold text-sm">
                      İndir
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
          {/** Alert */}
          {alertVisible && (
            <CustomAlert
              visible={alertVisible}
              handleDismiss={() => setAlertVisible(false)}
              title={alertTitle}
              text={alertText}
              alertType={alertType}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
