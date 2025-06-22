import { TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface DeleteButtonProps {
  onDelete: () => void;
  requireConfirmation?: boolean;
  confirmTime?: number;
  className?: string;
}

export function DeleteButton({
  onDelete,
  requireConfirmation = false,
  confirmTime = 1000,
  className = "",
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
        className={twMerge("btn btn-error", className)}
        onClick={onDelete}
      >
        <TrashIcon className="h-6 w-6" />
      </button>
    );
  }

  if (isTransitioning) {
    return (
      <div className="tooltip tooltip-error" data-tip="Click again to confirm">
        <button className={twMerge("btn btn-error", className)}>
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
          className={twMerge("btn btn-warning", className)}
          onClick={() => {
            onDelete();
            setIsConfirmed(false);
          }}
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <button
      className={twMerge("btn btn-error", className)}
      onClick={() => setIsConfirmed(true)}
    >
      <TrashIcon className="h-6 w-6" />
    </button>
  );
}
