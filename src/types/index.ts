// src/types/index.ts

export type FoodCategory =
  | "dairy"
  | "meat"
  | "vegetable"
  | "fruit"
  | "beverage"
  | "seasoning"
  | "frozen"
  | "other";

export interface FridgeItem {
  id: string;
  name: string;
  barcode?: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  expiryDate: string | null; // ISO日付文字列
  addedDate: string; // ISO日付文字列
  memo?: string;
}

export type ExpiryStatus = "expired" | "warning" | "ok";

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return "ok";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "warning";
  return "ok";
}

export function formatExpiryLabel(expiryDate: string | null): string {
  if (!expiryDate) return "期限なし";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return `${Math.abs(diffDays)}日超過`;
  if (diffDays === 0) return "今日まで";
  if (diffDays === 1) return "明日まで";
  return `あと${diffDays}日`;
}

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  dairy: "乳製品",
  meat: "肉・魚",
  vegetable: "野菜",
  fruit: "果物",
  beverage: "飲み物",
  seasoning: "調味料",
  frozen: "冷凍食品",
  other: "その他",
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  dairy: "🥛",
  meat: "🥩",
  vegetable: "🥦",
  fruit: "🍎",
  beverage: "🧃",
  seasoning: "🧂",
  frozen: "🧊",
  other: "📦",
};

export const UNIT_OPTIONS = [
  "個",
  "本",
  "袋",
  "枚",
  "g",
  "kg",
  "ml",
  "L",
  "パック",
  "箱",
];
