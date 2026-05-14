import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const iconMap = {
  success: <CheckCircle2 size={16} className="text-green-400" />,
  info: <Info size={16} className="text-blue-400" />,
  warn: <AlertTriangle size={16} className="text-yellow-400" />,
  error: <XCircle size={16} className="text-red-400" />,
};

export function Toaster() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed top-20 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "pointer-events-auto bg-[#0F1525] border border-white/10 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md"
            )}
          >
            {iconMap[t.type]}
            <span className="text-sm text-[#F1F5F9] flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#94A3B8] hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
