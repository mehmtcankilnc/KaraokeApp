import { useContext } from "react";
import { ModalContext } from "../providers/ModalProvider";

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(
      "useModal hook'u <ModalProvider> içerisinde kullanılmalıdır.",
    );
  }
  return context;
};
