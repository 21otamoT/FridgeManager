// src/screens/AddItemScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
} from "../types";
import { RootStackParamList } from "../../App";
import { useApi } from "../hooks/useApi";
import LoadingOverlay from "../components/Loadingoverlay";

type Route = RouteProp<RootStackParamList, "AddItem">;
type Nav = StackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: "#1B4332",
  accent: "#52B788",
  bg: "#F0F4F1",
  card: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#6B7280",
  border: "#D1FAE5",
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

export default function AddItemScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { addItem } = useFridgeStore();
  const { addProduct } = useApi();

  const [name, setName] = useState(route.params?.name ?? "");
  const [barcode] = useState(route.params?.barcode ?? "");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("個");
  const [memo, setMemo] = useState("");
  const [hasExpiry, setHasExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [needsRegistration] = useState(
    route.params?.needsRegistration ?? false,
  );
  const [saving, setSaving] = useState(false);

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setExpiryDate(date);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("入力エラー", "食品名を入力してください");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("入力エラー", "数量を正しく入力してください");
      return;
    }

    setSaving(true);

    // 検索でヒットしなかった商品はDBに登録して、次回以降スキャンした時に見つかるようにする
    if (needsRegistration && barcode) {
      try {
        await addProduct(barcode, name.trim());
      } catch (error) {
        console.error("商品登録に失敗しました:", error);
        // 登録に失敗してもローカルへの保存は続行する（致命的エラーにしない）
      }
    }

    addItem({
      name: name.trim(),
      barcode: barcode || undefined,
      category,
      quantity: qty,
      unit,
      expiryDate: hasExpiry ? expiryDate.toISOString() : null,
      memo: memo.trim() || undefined,
    });

    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* バーコード表示 */}
        {barcode ? (
          <View style={styles.barcodeRow}>
            <Text style={styles.barcodeText}>📊 バーコード: {barcode}</Text>
          </View>
        ) : null}

        {/* 食品名 */}
        <View style={styles.section}>
          <Text style={styles.label}>食品名 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例: 牛乳、卵、りんご"
            placeholderTextColor={COLORS.muted}
            returnKeyType="next"
          />
        </View>

        {/* カテゴリ */}
        <View style={styles.section}>
          <Text style={styles.label}>カテゴリ</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
                disabled={saving}
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
        <View style={styles.section}>
          <Text style={styles.label}>数量</Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={[styles.input, styles.qtyInput]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={COLORS.muted}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.unitScroll}
              contentContainerStyle={styles.unitContent}
            >
              {UNIT_OPTIONS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                  onPress={() => setUnit(u)}
                  disabled={saving}
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
        <View style={styles.section}>
          <View style={styles.expiryHeader}>
            <Text style={styles.label}>賞味期限</Text>
            <TouchableOpacity
              style={styles.toggleWrap}
              onPress={() => setHasExpiry(!hasExpiry)}
              disabled={saving}
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
              disabled={saving}
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
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* メモ */}
        <View style={styles.section}>
          <Text style={styles.label}>メモ（任意）</Text>
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
      </ScrollView>

      {/* 保存ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>🧊 冷蔵庫に登録する</Text>
        </TouchableOpacity>
      </View>
      <LoadingOverlay visible={saving} message="登録中..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  barcodeRow: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  barcodeText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  section: { marginBottom: 24 },
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
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
  unitScroll: { flex: 1 },
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
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 3,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
