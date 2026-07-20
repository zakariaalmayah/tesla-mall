import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric amount as Yemeni Rial currency, locale-aware.
 */
export function formatCurrency(amount: number | string, locale: "ar" | "en" = "ar"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-YE" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
  const label = locale === "ar" ? "ر.ي" : "YER";
  return locale === "ar" ? `${formatted} ${label}` : `${label} ${formatted}`;
}

/**
 * Format a date for display, locale-aware.
 */
export function formatDate(date: Date | string, locale: "ar" | "en" = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Generate a human-readable, sortable order number: TM-YYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TM-${y}${m}${d}-${rand}`;
}

/**
 * Truncate text to a maximum length, preserving whole words.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  return `${truncated.slice(0, truncated.lastIndexOf(" "))}…`;
}

export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/-+/g, "-");
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");
  if (cleaned.startsWith("+967")) {
    return cleaned;
  }
  if (cleaned.startsWith("00967")) {
    return "+" + cleaned.slice(2);
  }
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    return `+967${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return `+967${cleaned}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}
