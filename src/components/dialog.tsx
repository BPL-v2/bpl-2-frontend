import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

interface DialogProps {
  title: string | React.ReactNode;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
  className?: string;
}

export function Dialog({
  title,
  open,
  setOpen,
  children,
  closeOnOutsideClick = false,
  className = "",
}: DialogProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (!closeOnOutsideClick || !open) return;
    const handleClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [closeOnOutsideClick, open, setOpen]);
  return (
    <dialog open={open} className="modal">
      <div
        ref={boxRef}
        className={twMerge(
          "modal-box bg-base-200 border-2 border-base-100",
          className
        )}
      >
        <h3 className="font-bold text-lg mb-8">{title}</h3>
        <div className="w-full flex flex-col items-center">{children}</div>
      </div>
    </dialog>
  );
}
