import { createContext, ReactNode, useContext, useState } from "react";
import StatusModal from "../components/modals/StatusModal";
import ActionModal from "../components/modals/ActionModal";

export type StatusType = "success" | "error" | "info";

export interface StatusModalProps {
  type: StatusType;
  title: string;
  message: string;
}

export interface ActionModalProps {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

interface ModalContextValue {
  showStatusModal: (props: StatusModalProps) => void;
  showActionModal: (props: ActionModalProps) => void;
  hideModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<"status" | "action" | null>(
    null,
  );
  const [statusProps, setStatusProps] = useState<StatusModalProps | null>(null);
  const [actionProps, setActionProps] = useState<ActionModalProps | null>(null);

  const showStatusModal = (props: StatusModalProps) => {
    setStatusProps(props);
    setActiveModal("status");
  };

  const showActionModal = (props: ActionModalProps) => {
    setActionProps(props);
    setActiveModal("action");
  };

  const hideModal = () => {
    setActiveModal(null);
    setTimeout(() => {
      setStatusProps(null);
      setActionProps(null);
    }, 300);
  };

  return (
    <ModalContext.Provider
      value={{ showStatusModal, showActionModal, hideModal }}
    >
      {children}
      {activeModal === "status" && statusProps && (
        <StatusModal {...statusProps} onClose={hideModal} visible={true} />
      )}
      {activeModal === "action" && actionProps && (
        <ActionModal {...actionProps} onClose={hideModal} visible={true} />
      )}
    </ModalContext.Provider>
  );
}
