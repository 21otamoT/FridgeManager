// src/store/fridgeStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FridgeItem, FoodCategory } from "../types";

interface FridgeStore {
  items: FridgeItem[];
  addItem: (item: Omit<FridgeItem, "id" | "addedDate">) => void;
  updateItem: (id: string, updates: Partial<FridgeItem>) => void;
  removeItem: (id: string) => void;
  getItemsByCategory: (category: FoodCategory) => FridgeItem[];
  getExpiringItems: (withinDays?: number) => FridgeItem[];
  getExpiredItems: () => FridgeItem[];
}

export const useFridgeStore = create<FridgeStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newItem: FridgeItem = {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          addedDate: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      getExpiringItems: (withinDays = 3) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().items.filter((item) => {
          if (!item.expiryDate) return false;
          const expiry = new Date(item.expiryDate);
          const diffDays = Math.ceil(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          return diffDays >= 0 && diffDays <= withinDays;
        });
      },

      getExpiredItems: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().items.filter((item) => {
          if (!item.expiryDate) return false;
          const expiry = new Date(item.expiryDate);
          return expiry < today;
        });
      },
    }),
    {
      name: "fridge-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
