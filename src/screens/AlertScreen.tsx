// src/screens/AlertScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useFridgeStore } from "../store/fridgeStore";
import {
  FridgeItem,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  getExpiryStatus,
  formatExpiryLabel,
} from "../types";
import { RootStackParamList } from "../../App";

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

export default function AlertScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { getExpiredItems, getExpiringItems } = useFridgeStore();

  const expiredItems = getExpiredItems();
  const warningItems = getExpiringItems(3);

  const totalAlerts = expiredItems.length + warningItems.length;

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = getExpiryStatus(item.expiryDate);
    const statusColor = status === "expired" ? COLORS.danger : COLORS.warn;

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
        <View
          style={[styles.expiryBadge, { backgroundColor: `${statusColor}22` }]}
        >
          <Text style={[styles.expiryText, { color: statusColor }]}>
            {formatExpiryLabel(item.expiryDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 アラート</Text>
        <Text style={styles.headerSub}>
          {totalAlerts > 0 ? `${totalAlerts}件の通知` : "通知なし"}
        </Text>
      </View>

      {totalAlerts === 0 ? (
        /* アラートなし */
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>すべて新鮮です！</Text>
          <Text style={styles.emptyMsg}>
            期限切れ・期限間近の食品はありません
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* 期限切れ */}
              {expiredItems.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.sectionDot,
                        { backgroundColor: COLORS.danger },
                      ]}
                    />
                    <Text style={styles.sectionTitle}>期限切れ</Text>
                    <View
                      style={[
                        styles.sectionBadge,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sectionBadgeText,
                          { color: COLORS.danger },
                        ]}
                      >
                        {expiredItems.length}件
                      </Text>
                    </View>
                  </View>
                  {expiredItems.map((item) => (
                    <View key={item.id}>{renderItem({ item })}</View>
                  ))}
                </View>
              )}

              {/* 期限間近 */}
              {warningItems.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.sectionDot,
                        { backgroundColor: COLORS.warn },
                      ]}
                    />
                    <Text style={styles.sectionTitle}>期限間近（3日以内）</Text>
                    <View
                      style={[
                        styles.sectionBadge,
                        { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sectionBadgeText,
                          { color: COLORS.warn },
                        ]}
                      >
                        {warningItems.length}件
                      </Text>
                    </View>
                  </View>
                  {warningItems.map((item) => (
                    <View key={item.id}>{renderItem({ item })}</View>
                  ))}
                </View>
              )}
            </>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
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
  emptyMsg: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "700" },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    marginBottom: 10,
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
  expiryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 14,
  },
  expiryText: { fontSize: 12, fontWeight: "700" },
});
