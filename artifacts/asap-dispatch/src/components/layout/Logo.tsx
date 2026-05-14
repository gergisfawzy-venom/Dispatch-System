import { cn } from "@/lib/utils";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 28 : size === "lg" ? 44 : 34;
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-lg shrink-0"
        style={{
          width: dim,
          height: dim,
          background: "linear-gradient(135deg, #FF5C00 0%, #FF8A3D 100%)",
          boxShadow: "0 4px 16px -4px rgba(255,92,0,0.6)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={dim * 0.6} height={dim * 0.6}>
          <path
            d="M12 2L4 6v6c0 5.5 3.5 9.7 8 10 4.5-.3 8-4.5 8-10V6l-8-4z"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.12)"
          />
          <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-display font-bold tracking-tight", text)}>
          ASAP <span className="text-[#FF5C00]">Dispatch</span>
        </span>
        {size !== "sm" && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] mt-0.5">
            Tactical Command
          </span>
        )}
      </div>
    </div>
  );
}
