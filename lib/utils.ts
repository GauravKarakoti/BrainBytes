import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMetadataRootURL() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_APP_URL must be set for metadata generation.")
  }
  return new URL(baseUrl)
}

