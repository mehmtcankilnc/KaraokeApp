import { Modal, Pressable } from "react-native";
import { ReactNode } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type Props = {
  visible: boolean;
  handleDismiss: () => void;
  children: ReactNode;
};

export default function BaseModal({ visible, handleDismiss, children }: Props) {
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
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
