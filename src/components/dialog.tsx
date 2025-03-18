import { useEffect } from "react";

interface DialogProps {
  title: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ title, open, setOpen, children }: DialogProps) {
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
  }, [open]);
  return (
    <dialog open={open} className="modal">
      <div className="modal-box bg-base-200 border-2 border-base-100">
        <h3 className="font-bold text-lg mb-8">{title}</h3>
        <div className="w-full">{children}</div>
      </div>
    </dialog>
  );
}
