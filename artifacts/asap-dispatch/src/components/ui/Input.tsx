import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, hint, icon, error, className, ...rest }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs uppercase tracking-wider text-[#94A3B8] mb-1.5 font-medium">
          {label}
        </span>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            {icon}
          </span>
        )}
        <input
          {...rest}
          className={cn(
            "w-full bg-[#06080F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F1F5F9]",
            "focus:outline-none focus:border-[#FF5C00]/60 focus:ring-2 focus:ring-[#FF5C00]/20 transition disabled:opacity-50 disabled:cursor-not-allowed",
            !!icon && "pl-9",
            error && "border-red-500/50",
            className
          )}
        />
      </div>
      {hint && !error && (
        <span className="text-xs text-[#94A3B8] mt-1 block">{hint}</span>
      )}
      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </label>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, ...rest }: TextareaProps) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs uppercase tracking-wider text-[#94A3B8] mb-1.5 font-medium">
          {label}
        </span>
      )}
      <textarea
        {...rest}
        className={cn(
          "w-full bg-[#06080F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F1F5F9] min-h-[100px] resize-y",
          "focus:outline-none focus:border-[#FF5C00]/60 focus:ring-2 focus:ring-[#FF5C00]/20 transition disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500/50",
          className
        )}
      />
      {hint && !error && (
        <span className="text-xs text-[#94A3B8] mt-1 block">{hint}</span>
      )}
      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </label>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options?: { value: string | number; label: string }[];
}

export function Select({ label, hint, options, children, className, ...rest }: SelectProps) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs uppercase tracking-wider text-[#94A3B8] mb-1.5 font-medium">
          {label}
        </span>
      )}
      <select
        {...rest}
        className={cn(
          "w-full bg-[#06080F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F1F5F9]",
          "focus:outline-none focus:border-[#FF5C00]/60 focus:ring-2 focus:ring-[#FF5C00]/20 transition disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
      {hint && <span className="text-xs text-[#94A3B8] mt-1 block">{hint}</span>}
    </label>
  );
}
