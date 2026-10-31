import { Modal, type ModalProps } from "@mantine/core";

import type { ModalBaseProps } from "./modal-context";

export type MantineContextModalProps = ModalBaseProps &
  Omit<ModalProps, "children" | "onClose" | "opened">;

export function MantineContextModal({
  isOpen,
  onOpenChange,
  onCloseEnd,
  children,
  ...props
}: MantineContextModalProps) {
  return (
    <Modal
      {...props}
      opened={isOpen}
      onClose={() => onOpenChange(false)}
      onExitTransitionEnd={onCloseEnd}
    >
      {children}
    </Modal>
  );
}
