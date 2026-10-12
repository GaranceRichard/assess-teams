import type { ReactNode } from "react";

import { useModalFocus } from "./useModalFocus";
import "./modal.css";

type Props = {
  backdropClassName: string;
  children: ReactNode;
  labelledBy: string;
  describedBy?: string;
  onClose: () => void;
  dismissible?: boolean;
  closeOnBackdrop?: boolean;
};

export function Modal({
  backdropClassName,
  children,
  labelledBy,
  describedBy,
  onClose,
  dismissible = true,
  closeOnBackdrop = false,
}: Props) {
  const ref = useModalFocus(labelledBy);
  return (
    <dialog
      ref={ref}
      className="modal-layer"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
    >
      <div
        className={backdropClassName}
        onMouseDown={(event) => {
          if (
            closeOnBackdrop &&
            dismissible &&
            event.target === event.currentTarget
          ) {
            event.preventDefault();
            onClose();
          }
        }}
      >
        {children}
      </div>
    </dialog>
  );
}
