import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMetadataRootURL() {
  return new URL(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`)
}

