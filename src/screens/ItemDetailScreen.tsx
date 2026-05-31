// src/screens/ItemDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { useFridgeStore } from "../store/fridgeStore";
import {
  FoodCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  UNIT_OPTIONS,
  getExpiryStatus,
  formatExpiryLabel,
} from "../types";
import { RootStackParamList } from "../../App";

type Route = RouteProp<RootStackParamList, "ItemDetail">;
type Nav = StackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: "#1B4332",
  accent: "#52B788",
  bg: "#F0F4F1",
  card: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#6B7280",
  border: "#D1FAE5",
  warn: "#F59E0B",
  danger: "#EF4444",
  ok: "#52B788",
};

const CATEGORIES: FoodCategory[] = [
  "dairy",
  "meat",
  "vegetable",
  "fruit",
  "beverage",
  "seasoning",
  "frozen",
  "other",
];

export default function ItemDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { items, updateItem, removeItem } = useFridgeStore();

  const item = items.find((i) => i.id === route.params.itemId);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>食品が見つかりません</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<FoodCategory>(item.category);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [unit, setUnit] = useState(item.unit);
  const [memo, setMemo] = useState(item.memo ?? "");
  const [hasExpiry, setHasExpiry] = useState(item.expiryDate !== null);
  const [expiryDate, setExpiryDate] = useState<Date>(
    item.expiryDate ? new Date(item.expiryDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const status = getExpiryStatus(item.expiryDate);
  const statusColor =
    status === "expired"
      ? COLORS.danger
      : status === "warning"
        ? COLORS.warn
        : COLORS.ok;

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setExpiryDate(date);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("入力エラー", "食品名を入力してください");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("入力エラー", "数量を正しく入力してください");
      return;
    }

    updateItem(item.id, {
      name: name.trim(),
      category,
      quantity: qty,
      unit,
      expiryDate: hasExpiry ? expiryDate.toISOString() : null,
      memo: memo.trim() || undefined,
    });

    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("削除確認", `「${item.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          removeItem(item.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ステータスカード */}
      <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
        <Text style={styles.statusEmoji}>{CATEGORY_ICONS[item.category]}</Text>
        <View style={styles.statusBody}>
          <Text style={styles.statusName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}22` },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {formatExpiryLabel(item.expiryDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* 編集モード切替 */}
      <View style={styles.editHeader}>
        <Text style={styles.sectionTitle}>詳細情報</Text>
        <TouchableOpacity
          style={[styles.editBtn, editing && styles.editBtnActive]}
          onPress={() => (editing ? handleSave() : setEditing(true))}
        >
          <Text
            style={[styles.editBtnText, editing && styles.editBtnTextActive]}
          >
            {editing ? "💾 保存" : "✏️ 編集"}
          </Text>
        </TouchableOpacity>
      </View>

      {editing ? (
        /* 編集フォーム */
        <View style={styles.form}>
          {/* 食品名 */}
          <View style={styles.formSection}>
            <Text style={styles.label}>食品名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.muted}
            />
          </View>

          {/* カテゴリ */}
          <View style={styles.formSection}>
            <Text style={styles.label}>カテゴリ</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catBtn,
                    category === cat && styles.catBtnActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.catBtnEmoji}>{CATEGORY_ICONS[cat]}</Text>
                  <Text
                    style={[
                      styles.catBtnLabel,
                      category === cat && styles.catBtnLabelActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 数量・単位 */}
          <View style={styles.formSection}>
            <Text style={styles.label}>数量</Text>
            <View style={styles.qtyRow}>
              <TextInput
                style={[styles.input, styles.qtyInput]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor={COLORS.muted}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unitContent}
              >
                {UNIT_OPTIONS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitLabel,
                        unit === u && styles.unitLabelActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 賞味期限 */}
          <View style={styles.formSection}>
            <View style={styles.expiryHeader}>
              <Text style={styles.label}>賞味期限</Text>
              <TouchableOpacity
                style={styles.toggleWrap}
                onPress={() => setHasExpiry(!hasExpiry)}
              >
                <View style={[styles.toggle, hasExpiry && styles.toggleOn]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      hasExpiry && styles.toggleThumbOn,
                    ]}
                  />
                </View>
                <Text style={styles.toggleLabel}>
                  {hasExpiry ? "あり" : "なし"}
                </Text>
              </TouchableOpacity>
            </View>
            {hasExpiry && (
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateBtnText}>{formatDate(expiryDate)}</Text>
                <Text style={styles.dateArrow}>›</Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* メモ */}
          <View style={styles.formSection}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.memoInput]}
              value={memo}
              onChangeText={setMemo}
              placeholder="保存場所、開封日など..."
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      ) : (
        /* 表示モード */
        <View style={styles.infoCard}>
          <InfoRow
            label="カテゴリ"
            value={`${CATEGORY_ICONS[item.category]} ${CATEGORY_LABELS[item.category]}`}
          />
          <InfoRow label="数量" value={`${item.quantity}${item.unit}`} />
          <InfoRow
            label="賞味期限"
            value={
              item.expiryDate
                ? formatDate(new Date(item.expiryDate))
                : "期限なし"
            }
            valueColor={statusColor}
          />
          <InfoRow
            label="登録日"
            value={formatDate(new Date(item.addedDate))}
          />
          {item.barcode && <InfoRow label="バーコード" value={item.barcode} />}
          {item.memo && <InfoRow label="メモ" value={item.memo} />}
        </View>
      )}

      {/* 削除ボタン */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>🗑 この食品を削除する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: { fontSize: 14, color: COLORS.muted, fontWeight: "600" },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 60 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: { fontSize: 16, color: COLORS.muted },
  backBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: { color: "#FFF", fontWeight: "700" },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    elevation: 2,
    gap: 14,
  },
  statusEmoji: { fontSize: 40 },
  statusBody: { flex: 1, gap: 8 },
  statusName: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 13, fontWeight: "700" },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  editBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  editBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.accent },
  editBtnTextActive: { color: "#FFF" },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
  },
  form: { gap: 4 },
  formSection: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  memoInput: { minHeight: 80, paddingTop: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: "22%",
  },
  catBtnActive: { borderColor: COLORS.accent, backgroundColor: "#E8F5EF" },
  catBtnEmoji: { fontSize: 16 },
  catBtnLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  catBtnLabelActive: { color: COLORS.primary },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyInput: { width: 90 },
  unitContent: { gap: 8, alignItems: "center" },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  unitBtnActive: { borderColor: COLORS.accent, backgroundColor: "#E8F5EF" },
  unitLabel: { fontSize: 14, color: COLORS.muted, fontWeight: "600" },
  unitLabelActive: { color: COLORS.primary },
  expiryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toggleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 14, color: COLORS.muted, fontWeight: "600" },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: "flex-end" },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dateIcon: { fontSize: 18 },
  dateBtnText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: "600" },
  dateArrow: { fontSize: 20, color: COLORS.muted },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FECACA",
  },
  deleteBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: "700" },
});
