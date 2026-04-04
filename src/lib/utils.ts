import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | Decimal | null | undefined): string {
  if (amount === null || amount === undefined) return "R 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return "R 0.00";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function calculateVAT(amount: number): number {
  return Number((amount * 0.15).toFixed(2));
}

export function addVAT(amount: number): number {
  return Number((amount * 1.15).toFixed(2));
}

export function generatePONumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PO-${year}-${random}`;
}

export function generateRFQNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `RFQ-${year}-${random}`;
}

export function generateDeliveryNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `DEL-${year}-${random}`;
}

export function getDaysUntilExpiry(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const expiryDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryAlertLevel(daysUntilExpiry: number | null): "critical" | "warning" | "normal" | null {
  if (daysUntilExpiry === null) return null;
  if (daysUntilExpiry <= 30) return "critical";
  if (daysUntilExpiry <= 60) return "warning";
  if (daysUntilExpiry <= 90) return "normal";
  return null;
}

export function getBudgetVariancePercentage(committed: number, budget: number): number {
  if (budget === 0) return 0;
  return Number(((committed / budget) * 100).toFixed(1));
}

export function canUserAccessRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export const CIDB_GRADES = [
  { grade: 1, description: "Single category, single discipline, up to R500,000", maxValue: 500000 },
  { grade: 2, description: "Single category, up to R1,000,000", maxValue: 1000000 },
  { grade: 3, description: "Single category, up to R2,000,000", maxValue: 2000000 },
  { grade: 4, description: "Single category, up to R4,000,000", maxValue: 4000000 },
  { grade: 5, description: "Single category, up to R7,000,000", maxValue: 7000000 },
  { grade: 6, description: "Single category, up to R12,000,000", maxValue: 12000000 },
  { grade: 7, description: "Single category, up to R20,000,000", maxValue: 20000000 },
  { grade: 8, description: "Two categories, up to R40,000,000", maxValue: 40000000 },
  { grade: 9, description: "Unlimited categories and value", maxValue: Infinity },
];

export const BEE_LEVELS = [
  { level: "1", points: 100, qualification: "100% Black ownership" },
  { level: "2", points: 90, qualification: ">75% Black ownership" },
  { level: 3, points: 80, qualification: ">50% Black ownership" },
  { level: 4, points: 75, qualification: ">40% Black ownership" },
  { level: 5, points: 70, qualification: ">30% Black ownership" },
  { level: 6, points: 60, qualification: ">25% Black ownership" },
  { level: 7, points: 55, qualification: ">20% Black ownership" },
  { level: 8, points: 50, qualification: ">10% Black ownership" },
  { level: 9, points: 40, qualification: "<10% Black ownership" },
  { level: "Non-compliant", points: 0, qualification: "Below level 9" },
];

export const COST_CODE_CATEGORIES = [
  "Materials",
  "Labour",
  "Plant & Equipment",
  "Subcontractors",
  "Preliminaries",
  "Overheads",
  "Contingency",
];

export const MATERIAL_CATEGORIES = [
  "Concrete",
  "Steel & Reinforcement",
  "Timber & Shutterboard",
  "Waterproofing",
  "Insulation",
  "Roofing",
  "Finishes",
  "Plumbing",
  "Electrical",
  "Civil Works",
  "Other",
];

export type Decimal = {
  toNumber(): number;
};