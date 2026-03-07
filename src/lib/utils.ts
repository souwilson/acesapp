import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLATFORM_OPTIONS = [
  { value: 'meta',    label: 'Meta (Facebook)' },
  { value: 'google',  label: 'Google' },
  { value: 'tiktok',  label: 'TikTok' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'other',   label: 'Outro' },
] as const;

export function platformLabel(value: string): string {
  return PLATFORM_OPTIONS.find((p) => p.value === value)?.label ?? value;
}
