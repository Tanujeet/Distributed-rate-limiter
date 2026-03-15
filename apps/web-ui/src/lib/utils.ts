import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines Tailwind classes safely — resolves conflicts like `h-4 h-6` → `h-6`
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
