import { View, Text, Pressable } from "react-native";
import React from "react";
import BaseModal from "./BaseModal";

type Props = {
  onClose: () => void;
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
};

export default function ActionModal({
  onClose,
  visible,
  title,
  message,
  confirmText = "Onayla",
  onConfirm,
}: Props) {
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
          onPress={onConfirm}
          className="flex-1 bg-[#131e29] p-4 rounded-xl items-center"
        >
          <Text className="text-[#fee9e6] font-medium text-base">
            {confirmText}
          </Text>
        </Pressable>
      </View>
    </BaseModal>
  );
}
