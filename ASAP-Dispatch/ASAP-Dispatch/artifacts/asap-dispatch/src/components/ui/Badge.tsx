import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Color =
  | "orange"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "gray"
  | "purple";

interface Props {
  color?: Color;
  children?: ReactNode;
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
  icon?: ReactNode;
}

const colorMap: Record<Color, string> = {
  orange: "bg-[#FF5C00]/10 text-[#FFA66B] border-[#FF5C00]/30",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  green: "bg-green-500/10 text-green-300 border-green-500/30",
  yellow: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  red: "bg-red-500/10 text-red-300 border-red-500/30",
  gray: "bg-white/5 text-[#94A3B8] border-white/10",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
};

const dotMap: Record<Color, string> = {
  orange: "bg-[#FF5C00]",
  blue: "bg-blue-400",
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  red: "bg-red-400",
  gray: "bg-slate-400",
  purple: "bg-purple-400",
};

export function Badge({
  color = "gray",
  children,
  size = "sm",
  pulse,
  className,
  icon,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full font-medium uppercase tracking-wider whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        colorMap[color],
        className
      )}
    >
      {icon ??
        (pulse ? (
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                dotMap[color]
              )}
            />
            <span
              className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotMap[color])}
            />
          </span>
        ) : (
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotMap[color])} />
        ))}
      {children}
    </span>
  );
}
