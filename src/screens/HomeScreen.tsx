// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useFridgeStore } from "../store/fridgeStore";
import {
  FridgeItem,
  FoodCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  getExpiryStatus,
  formatExpiryLabel,
} from "../types";
import { RootStackParamList } from "../../App";
import AdBanner from "../components/Adbanner";
import { MobileAds } from "react-native-google-mobile-ads";

type Nav = StackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: "#1B4332",
  accent: "#52B788",
  bg: "#F0F4F1",
  card: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#6B7280",
  warn: "#F59E0B",
  danger: "#EF4444",
  ok: "#52B788",
};

const CATEGORIES: (FoodCategory | "all")[] = [
  "all",
  "dairy",
  "meat",
  "vegetable",
  "fruit",
  "beverage",
  "seasoning",
  "frozen",
  "other",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { items, removeItem } = useFridgeStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    FoodCategory | "all"
  >("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.includes(search) || (item.barcode?.includes(search) ?? false);
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [items, search, selectedCategory]);

  const sortedItems = useMemo(() => {
    const expired = filtered.filter(
      (i) => getExpiryStatus(i.expiryDate) === "expired",
    );
    const warning = filtered.filter(
      (i) => getExpiryStatus(i.expiryDate) === "warning",
    );
    const ok = filtered.filter((i) => getExpiryStatus(i.expiryDate) === "ok");
    return [...expired, ...warning, ...ok];
  }, [filtered]);

  const confirmDelete = (item: FridgeItem) => {
    Alert.alert("削除確認", `「${item.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => removeItem(item.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = getExpiryStatus(item.expiryDate);
    const statusColor =
      status === "expired"
        ? COLORS.danger
        : status === "warning"
          ? COLORS.warn
          : COLORS.ok;

    useEffect(() => {
      // 広告の初期化
      MobileAds()
        .initialize()
        .then(() => {
          // 初期化完了後の処理
          console.log("AdMob initialized");
        });
    }, []);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
        activeOpacity={0.75}
      >
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        <View style={styles.itemEmoji}>
          <Text style={styles.emojiText}>{CATEGORY_ICONS[item.category]}</Text>
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemSub}>
            {item.quantity}
            {item.unit} · {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <View
            style={[
              styles.expiryBadge,
              { backgroundColor: `${statusColor}22` },
            ]}
          >
            <Text style={[styles.expiryText, { color: statusColor }]}>
              {formatExpiryLabel(item.expiryDate)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => confirmDelete(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🧊 冷蔵庫</Text>
          <Text style={styles.headerSub}>{items.length}品登録中</Text>
        </View>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate("Scan")}
        >
          <Text style={styles.scanBtnText}>📷 スキャン</Text>
        </TouchableOpacity>
      </View>

      {/* 検索 */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="食品名・バーコードで検索"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* カテゴリフィルター */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryContent}
        renderItem={({ item: cat }) => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                {cat === "all"
                  ? "すべて"
                  : `${CATEGORY_ICONS[cat as FoodCategory]} ${CATEGORY_LABELS[cat as FoodCategory]}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* リスト */}
      {sortedItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🧊</Text>
          <Text style={styles.emptyTitle}>食品がありません</Text>
          <Text style={styles.emptyMsg}>
            バーコードをスキャンして追加しましょう
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate("AddItem", {})}
          >
            <Text style={styles.emptyBtnText}>＋ 手動で追加</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate("AddItem", {})}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  scanBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
  },
  scanBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  categoryList: { maxHeight: 50 },
  categoryContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  catChipActive: { borderColor: COLORS.accent, backgroundColor: "#E8F5EF" },
  catLabel: { fontSize: 13, color: COLORS.muted, fontWeight: "600" },
  catLabelActive: { color: COLORS.primary },
  listContent: { padding: 16, gap: 10, paddingBottom: 100 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  statusBar: { width: 4, alignSelf: "stretch" },
  itemEmoji: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  emojiText: { fontSize: 26 },
  itemBody: { flex: 1, paddingVertical: 14, paddingLeft: 4 },
  itemName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  itemSub: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  itemRight: {
    alignItems: "flex-end",
    paddingRight: 14,
    paddingVertical: 12,
    gap: 6,
  },
  expiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expiryText: { fontSize: 12, fontWeight: "700" },
  deleteIcon: { fontSize: 16 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyMsg: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  emptyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  fab: {
    position: "absolute",
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { color: "#FFF", fontSize: 28, lineHeight: 32 },
});
