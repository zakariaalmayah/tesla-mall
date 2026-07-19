"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GalleryMedia {
  id: string;
  url: string;
  alt: string;
}

export function ProductGallery({ media, fallbackAlt }: { media: GalleryMedia[]; fallbackAlt: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = media[activeIndex];

  if (media.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {fallbackAlt}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          key={active.id}
          src={active.url}
          alt={active.alt || fallbackAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-y-auto">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:w-full",
                index === activeIndex ? "border-gold-500" : "border-border hover:border-gold-500/50",
              )}
              aria-label={`${fallbackAlt} ${index + 1}`}
            >
              <Image src={item.url} alt={item.alt || fallbackAlt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
