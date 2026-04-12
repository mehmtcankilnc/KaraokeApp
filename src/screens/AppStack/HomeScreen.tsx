import {
  View,
  Text,
  FlatList,
  Pressable,
  Linking,
  AppState,
  AppStateStatus,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { musics } from "../../data/musics";
import { Play } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/navigation.types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Music } from "../../types/types";
import { AudioModule } from "expo-audio";
import { useModal } from "../../hooks/useModal";

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { showActionModal, showStatusModal, hideModal } = useModal();
  const insets = useSafeAreaInsets();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = useCallback(async () => {
    let status = await AudioModule.getRecordingPermissionsAsync();

    if (!status.granted && status.canAskAgain) {
      status = await AudioModule.requestRecordingPermissionsAsync();
    }

    setHasPermission(status.granted);

    if (status.granted && navigation.isFocused()) {
      hideModal();
    }
  }, [hideModal]);

  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkPermission();
        }
      },
    );

    checkPermission();

    return () => sub.remove();
  }, [checkPermission]);

  const forcePermissionModal = () => {
    showActionModal({
      title: "Mikrofon Erişimi Gerekli",
      message:
        "Uygulamayı kullanabilmek için mikrofon izni vermeniz şarttır. Lütfen ayarlardan izni açın.",
      confirmText: "Ayarlara Git",
      onConfirm: () => Linking.openSettings(),
    });
  };

  if (hasPermission === null) {
    return <View className="flex-1 bg-[#131e29]" />;
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-[#131e29] items-center justify-center p-10">
        <Text className="text-white text-xl font-bold text-center mb-5">
          Mikrofon izni olmadan devam edemezsiniz.
        </Text>
        <Pressable
          onPress={forcePermissionModal}
          className="bg-[#fee9e6] px-10 py-4 rounded-xl"
        >
          <Text className="text-[#131e29] font-bold">İzinleri Yönet</Text>
        </Pressable>
      </View>
    );
  }

  const handleMusicSelect = (music: Music) => {
    showActionModal({
      title: "Emin misiniz?",
      message:
        "Bu şarkı ile ilerlemek istediğinize emin misiniz? Ses kaydı otomatik olarak başlatılacaktır. Ayrıca daha kaliteli bir karaoke deneyimi için kulaklık kullanmanız önerilir.",
      confirmText: "Evet",
      onConfirm: () => handleNavigation(music),
    });
  };

  const handleNavigation = (music: Music) => {
    if (music) {
      hideModal();
      navigation.navigate("Music", { music: music });
    } else {
      showStatusModal({
        type: "error",
        title: "Müzik Seçilmedi.",
        message: "Henüz müzik seçimi yapılmamış, lütfen müzik seçiniz.",
      });
      console.log("Müzik seçilmedi.");
    }
  };

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
        Karaoke
      </Text>
      {/** List */}
      <FlatList
        data={musics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <View
              className="flex-row w-full bg-[#fee9e6] rounded-xl justify-between items-center"
              style={{
                padding: wp(2),
                marginBottom: item.id !== musics.length ? wp(2) : 0,
              }}
            >
              <Text
                style={{
                  color: "#131e29",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {item.title}
              </Text>
              <Pressable
                onPress={() => handleMusicSelect(item)}
                className="bg-[#131e29] rounded-lg items-center justify-center"
                style={{ padding: wp(3) }}
              >
                <Play color={"#ffffff"} />
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}
