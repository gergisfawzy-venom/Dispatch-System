import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-[#94A3B8]">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-[#94A3B8]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base text-[#F1F5F9]">{title}</h3>
      {description && (
        <p className="text-sm mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
