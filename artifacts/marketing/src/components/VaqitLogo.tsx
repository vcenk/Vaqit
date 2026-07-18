import { cn } from "@/lib/utils";

/**
 * Vaqit logo mark — a pointed mihrab arch with a qibla compass needle.
 *
 * The mihrab is the niche in every mosque wall that shows the direction
 * of prayer. The needle points toward the apex, evoking both a compass
 * and a clock hand. Together they say: time + direction = prayer.
 *
 * Use `size` to control the rendered px size of the mark (default 32).
 * The wordmark is shown when `showWordmark` is true (default).
 */

interface VaqitLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function VaqitLogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle inner fill so the arch reads as a shape, not just lines */}
      <path
        d="M 9.5 26.5 L 9.5 18 C 9.5 11.5 12.8 6.5 16 6.5 C 19.2 6.5 22.5 11.5 22.5 18 L 22.5 26.5 Z"
        fill="currentColor"
        opacity="0.07"
      />

      {/* The pointed arch — left side rises to apex, right side mirrors */}
      <path
        d="M 9.5 26.5 L 9.5 18 C 9.5 11.5 12.8 6.5 16 6.5 C 19.2 6.5 22.5 11.5 22.5 18 L 22.5 26.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Base line — the floor of the mihrab */}
      <line
        x1="7"
        y1="26.5"
        x2="25"
        y2="26.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Pivot point — where you stand */}
      <circle cx="16" cy="21.5" r="1.4" fill="currentColor" />

      {/* Compass/prayer needle — points toward the apex */}
      <line
        x1="16"
        y1="21.5"
        x2="16"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Apex dot — the qibla point */}
      <circle cx="16" cy="10" r="1.2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function VaqitLogo({
  size = 32,
  showWordmark = true,
  className,
  wordmarkClassName,
}: VaqitLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Mark container — matches the rounded-square app icon shape */}
      <div
        className="shrink-0 rounded-[7px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-colors group-hover:border-primary/40"
        style={{ width: size, height: size }}
      >
        <VaqitLogoMark size={Math.round(size * 0.72)} />
      </div>

      {showWordmark && (
        <span
          className={cn(
            "font-serif font-bold tracking-wide text-foreground select-none",
            wordmarkClassName,
          )}
        >
          Vaqit
        </span>
      )}
    </div>
  );
}
