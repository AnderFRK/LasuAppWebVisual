import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. Eliminamos ': ClassValue[]' de los 'inputs'
export function cn(...inputs) {
  // 2. Eliminamos 'type ClassValue' de la importación de 'clsx'
  return twMerge(clsx(inputs));
}