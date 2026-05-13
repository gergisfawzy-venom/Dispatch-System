import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ containerClassName, className, ...rest }: Props) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
      />
      <input
        type="search"
        {...rest}
        className={cn(
          "w-full bg-[#06080F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-[#F1F5F9]",
          "focus:outline-none focus:border-[#FF5C00]/60 focus:ring-2 focus:ring-[#FF5C00]/20 transition",
          className
        )}
      />
    </div>
  );
}
