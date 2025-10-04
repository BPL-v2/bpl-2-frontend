import { TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface DeleteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  onDelete: () => void;
  requireConfirmation?: boolean;
  confirmTime?: number;
}

export function DeleteButton({
  onDelete,
  requireConfirmation = false,
  confirmTime = 1000,
  ...props
}: DeleteButtonProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isConfirmed && requireConfirmation) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, confirmTime);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, requireConfirmation, confirmTime]);

  if (!requireConfirmation) {
    return (
      <button
        className={twMerge("btn btn-error", props.className)}
        onClick={onDelete}
      >
        <TrashIcon className="size-6" />
      </button>
    );
  }

  if (isTransitioning) {
    return (
      <div className="tooltip tooltip-error" data-tip="Click again to confirm">
        <button
          {...props}
          className={twMerge("btn btn-error", props.className)}
        >
          <div className="loading loading-spinner"></div>
        </button>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div
        className="tooltip tooltip-warning"
        data-tip="Click again to confirm"
      >
        <button
          {...props}
          className={twMerge("btn btn-warning", props.className)}
          onClick={() => {
            onDelete();
            setIsConfirmed(false);
          }}
        >
          <TrashIcon className="size-6" />
        </button>
      </div>
    );
  }

  return (
    <button
      {...props}
      className={twMerge("btn btn-error", props.className)}
      onClick={() => setIsConfirmed(true)}
    >
      <TrashIcon className="size-6" />
    </button>
  );
}
