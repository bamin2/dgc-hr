import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getResponsiveFontSize(value: string | number): string {
  const length = String(value).length;
  if (length <= 8) return "text-2xl";
  if (length <= 11) return "text-lg";
  if (length <= 14) return "text-base";
  return "text-sm";
}
