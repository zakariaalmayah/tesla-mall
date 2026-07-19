import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = "sm",
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}) {
  const sizeClass = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.floor(rounded);
          const half = !filled && i + 0.5 === rounded;
          return (
            <span key={i} className="relative">
              <Star className={cn(sizeClass, "text-muted-foreground/30")} />
              {(filled || half) && (
                <Star
                  className={cn(
                    sizeClass,
                    "absolute inset-0 fill-gold-500 text-gold-500",
                    half && "[clip-path:inset(0_50%_0_0)]",
                  )}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground">
          {value.toFixed(1)}
          {count != null && (
            <span className="ltr:before:content-['('] ltr:after:content-[')'] rtl:before:content-['('] rtl:after:content-[')']">
              {" "}
              {count}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
