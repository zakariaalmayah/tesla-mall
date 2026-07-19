import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
  theme?: "light" | "dark";
}

/**
 * Tesla Mall wordmark, reconstructed as inline SVG from the brand logo:
 * "TESLA" in outlined letterforms with a gold middle bar on the "E",
 * "MALL" in solid gold beneath, and a gold smile-arrow underline.
 * Rendering as SVG (not a raster export) keeps the header crisp at any size
 * and lets the mark adapt automatically between light and dark surfaces.
 */
export function Logo({ className, variant = "full", theme = "light" }: LogoProps) {
  const strokeColor = theme === "light" ? "#0A0A0B" : "#FFFFFF";

  return (
    <svg
      viewBox="0 0 340 120"
      className={cn("h-auto w-40", className)}
      role="img"
      aria-label="Tesla Mall"
    >
      <defs>
        <linearGradient id="tm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EAD6A0" />
          <stop offset="45%" stopColor="#C6A048" />
          <stop offset="100%" stopColor="#8E6D28" />
        </linearGradient>
      </defs>

      {/* TESLA wordmark */}
      <g fill="none" stroke={strokeColor} strokeWidth="3">
        <path d="M10 20 H50 M30 20 V52" />
        <path d="M110 20 H82 a10 10 0 0 0 0 20 h10 a10 10 0 0 1 0 20 H80" />
        <path d="M140 20 V52 H166" />
        <path d="M210 52 L226 20 L242 52 M215 44 H237" />
      </g>
      <rect x="60" y="20" width="16" height="7" fill="url(#tm-gold)" />
      <rect x="60" y="32" width="16" height="7" fill="url(#tm-gold)" />
      <rect x="60" y="44" width="16" height="7" fill="url(#tm-gold)" />
      <circle cx="226" cy="44" r="4" fill="url(#tm-gold)" />

      {variant === "full" && (
        <>
          {/* MALL */}
          <g fill="url(#tm-gold)" fontFamily="Inter, sans-serif" fontWeight="700">
            <text x="170" y="80" fontSize="22" letterSpacing="6" textAnchor="middle">
              MALL
            </text>
          </g>

          {/* Smile / arrow underline, an homage to the marketplace mark */}
          <path
            d="M40 95 Q170 125 300 90"
            fill="none"
            stroke="url(#tm-gold)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M285 82 L302 90 L292 106"
            fill="none"
            stroke="url(#tm-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
