"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  UNAUTHORIZED: "غير مصرّح لك برفع الصور",
  UNSUPPORTED_FILE_TYPE: "نوع الملف غير مدعوم (JPEG, PNG, WEBP, GIF فقط)",
  FILE_TOO_LARGE: "حجم الملف يتجاوز 5 ميجابايت",
  UPLOAD_FAILED: "فشل رفع الصورة",
  STORAGE_NOT_CONFIGURED: "تخزين الصور غير مُهيّأ بعد على الخادم",
  NO_FILE: "لم يتم اختيار ملف",
  GENERIC_ERROR: "حدث خطأ ما أثناء الرفع",
};

export function ImageUploader({
  folder = "products",
  value,
  onChange,
  maxImages = 8,
}: {
  folder?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      toast.error(`الحد الأقصى ${maxImages} صور`);
      return;
    }

    const fileArray = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    const uploaded: string[] = [];
    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();

        if (!response.ok) {
          toast.error(errorMessages[data.error] ?? errorMessages.GENERIC_ERROR);
          continue;
        }
        uploaded.push(data.url as string);
      } catch {
        toast.error(errorMessages.GENERIC_ERROR);
      }
    }

    if (uploaded.length > 0) {
      onChange([...value, ...uploaded]);
    }
    setIsUploading(false);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void uploadFiles(e.target.files);
    }
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="إزالة الصورة"
                className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            isDragging ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-border hover:border-gold-400",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isUploading ? "جارٍ الرفع..." : "اسحب الصور هنا أو انقر للاختيار"}
          </p>
          <p className="text-xs text-muted-foreground/70">JPEG, PNG, WEBP — حتى 5 ميجابايت لكل صورة</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      )}
    </div>
  );
}
