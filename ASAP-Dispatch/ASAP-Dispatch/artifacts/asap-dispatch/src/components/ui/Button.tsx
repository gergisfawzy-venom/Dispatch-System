import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#FF5C00] text-white hover:bg-[#FF7A2A] active:bg-[#E54E00] shadow-[0_4px_24px_-8px_rgba(255,92,0,0.6)]",
  secondary:
    "bg-[#0F1525] text-[#F1F5F9] border border-white/10 hover:bg-[#161D30] hover:border-white/20",
  ghost:
    "bg-transparent text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50",
  success:
    "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-6 py-3 text-base gap-2 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  loading,
  children,
  fullWidth,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080F]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...(rest as Record<string, unknown>)}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </motion.button>
  );
}
