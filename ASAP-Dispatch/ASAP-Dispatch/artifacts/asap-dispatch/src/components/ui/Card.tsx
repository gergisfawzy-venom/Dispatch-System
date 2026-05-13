import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padded?: boolean;
  accent?: "orange" | "blue" | "green" | "yellow" | "red" | "none";
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  orange: "border-l-4 border-l-[#FF5C00]",
  blue: "border-l-4 border-l-[#3B82F6]",
  green: "border-l-4 border-l-[#22C55E]",
  yellow: "border-l-4 border-l-[#F59E0B]",
  red: "border-l-4 border-l-[#EF4444]",
  none: "",
};

export function Card({
  children,
  padded = true,
  accent = "none",
  className,
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "bg-[#0A0E1A] border border-white/[0.06] rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]",
        padded && "p-4",
        accentMap[accent],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
