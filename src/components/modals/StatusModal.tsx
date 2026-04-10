import { Text, Pressable, View } from "react-native";
import React from "react";
import { StatusType } from "../../providers/ModalProvider";
import BaseModal from "./BaseModal";

type Props = {
  visible: boolean;
  onClose: () => void;
  type: StatusType;
  title: string;
  message: string;
};

export default function StatusModal({
  onClose,
  visible,
  type,
  title,
  message,
}: Props) {
  const buttonBgColor =
    type === "info" ? "#e5e7eb" : type === "success" ? "#131e29" : "#e74c3c";

  return (
    <BaseModal visible={visible} handleDismiss={onClose}>
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
        {message}
      </Text>
      <View className="w-full flex-row justify-between">
        <Pressable
          onPress={onClose}
          className="flex-1 p-4 rounded-xl items-center"
          style={{ backgroundColor: buttonBgColor }}
        >
          <Text
            className="font-semibold text-base"
            style={{ color: type === "info" ? "#131e29" : "#fee9e6" }}
          >
            Tamam
          </Text>
        </Pressable>
      </View>
    </BaseModal>
  );
}
