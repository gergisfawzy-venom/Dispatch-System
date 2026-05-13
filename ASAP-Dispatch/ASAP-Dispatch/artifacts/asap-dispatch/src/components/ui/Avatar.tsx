import { avatarColorFor, cn, getInitials } from "@/lib/utils";

interface Props {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function Avatar({ name, src, size = 36, className, ring }: Props) {
  const initials = getInitials(name);
  const color = avatarColorFor(name);
  
  return (
    <div
      className={cn(
        "rounded-full inline-flex items-center justify-center font-display font-bold text-white shrink-0 overflow-hidden",
        ring && "ring-2 ring-white/10 ring-offset-2 ring-offset-[#0A0E1A]",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: src ? "transparent" : color,
        fontSize: size * 0.38,
        letterSpacing: "-0.02em",
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
