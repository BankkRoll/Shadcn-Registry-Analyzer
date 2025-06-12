import { cn } from "@/lib/utils";
import * as React from "react";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SidePanel({
  open,
  onClose,
  title,
  children,
  className,
}: SidePanelProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={cn(
          "relative ml-auto h-full w-full max-w-xl bg-card shadow-xl flex flex-col animate-in slide-in-from-right duration-200",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4">
          <div className="font-semibold text-lg truncate">{title}</div>
          <button
            onClick={onClose}
            className="rounded p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close panel"
          >
            <span aria-hidden>×</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </aside>
    </div>
  );
}
