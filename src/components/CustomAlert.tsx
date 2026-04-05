import { Modal, Pressable, Text, View } from "react-native";
import React from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type Props = {
  visible: boolean;
  handleDismiss: () => void;
  handleSubmit?: () => void;
  title: string;
  text: string;
  alertType?: "success" | "failure";
};

export default function CustomAlert({
  visible,
  handleDismiss,
  handleSubmit,
  title,
  text,
  alertType = "failure",
}: Props) {
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
          <Text
            style={{
              color: "#131e29",
              fontSize: 24,
              fontWeight: 800,
              alignSelf: "center",
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
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
            {text}
          </Text>
          <View
            className="w-full gap-y-3 flex-row justify-between"
            style={{ gap: wp(5) }}
          >
            <Pressable
              onPress={handleDismiss}
              className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
            >
              <Text className="text-[#131e29] font-semibold text-base">
                {alertType === "failure" ? "Geri" : "Tamam"}
              </Text>
            </Pressable>
            {handleSubmit !== undefined && (
              <Pressable
                onPress={handleSubmit}
                className="flex-1 bg-[#131e29] p-4 rounded-xl items-center"
              >
                <Text className="text-[#fee9e6] font-medium text-base">
                  Devam
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
