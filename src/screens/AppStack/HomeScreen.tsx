import { View, Text, FlatList, Pressable } from "react-native";
import React, { useState } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Music, musics } from "../../data/musics";
import { Play } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "../../components/CustomAlert";

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedItem, setSelectedItem] = useState<Music>();
  const [alertVisible, setAlertVisible] = useState(false);

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
                onPress={() => {
                  setSelectedItem(item);
                  setAlertVisible(true);
                }}
                className="bg-[#131e29] rounded-lg items-center justify-center"
                style={{ padding: wp(3) }}
              >
                <Play color={"#ffffff"} />
              </Pressable>
            </View>
          );
        }}
      />
      {/** Custom Alert */}
      {alertVisible && (
        <CustomAlert
          visible={alertVisible}
          handleDismiss={() => setAlertVisible(false)}
          handleSubmit={() => {
            setAlertVisible(false);
            navigation.navigate("Music", { music: selectedItem });
          }}
          title={"Bilgilendirme"}
          text={
            "Bu şarkı ile ilerlemek istediğinize emin misiniz? Ses kaydı otomatik olarak başlatılacaktır. Ayrıca daha kaliteli bir karaoke deneyimi için kulaklık kullanmanız önerilir."
          }
        />
      )}
    </View>
  );
}
