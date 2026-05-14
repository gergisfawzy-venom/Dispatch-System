import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: ReactNode;
}

const widths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[92vw]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "md",
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "relative w-full bg-[#0A0E1A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]",
              widths[width]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-white/[0.06]">
              <div className="min-w-0">
                {title && (
                  <h2 className="font-display text-xl text-[#F1F5F9] truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-[#94A3B8] mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
