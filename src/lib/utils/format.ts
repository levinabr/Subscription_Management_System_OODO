import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats integer paise into currency string (e.g. 125050 -> "₹1,250.50")
 */
export function formatPaise(paise: number, currency = "INR"): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts user input rupees to integer paise (e.g. 1250.50 -> 125050)
 */
export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formats basis points into percentage string (e.g. 1800 -> "18.00%")
 */
export function formatBasisPoints(bps: number): string {
  const pct = bps / 100;
  return `${pct.toFixed(2)}%`;
}

/**
 * Converts percentage to basis points (e.g. 18 -> 1800)
 */
export function percentageToBasisPoints(percentage: number | string): number {
  const num = typeof percentage === "string" ? parseFloat(percentage) : percentage;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Date formatter for financial SaaS
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
