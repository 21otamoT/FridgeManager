// src/screens/ScanScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

type Nav = StackNavigationProp<RootStackParamList>;

const COLORS = {
  accent: "#52B788",
  muted: "#6B7280",
};

export default function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // 権限未確認
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // 権限なし
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>カメラの使用許可が必要です</Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={async () => {
            const result = await requestPermission();
            if (!result.granted) {
              Alert.alert(
                "許可が必要です",
                "設定アプリからカメラの使用を許可してください",
                [
                  { text: "キャンセル", style: "cancel" },
                  { text: "設定を開く", onPress: () => Linking.openSettings() },
                ],
              );
            }
          }}
        >
          <Text style={styles.permBtnText}>許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchProductName = async (barcode: string): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );
      const data = await res.json();
      if (data.status === 1 && data.product?.product_name_ja) {
        return data.product.product_name_ja;
      }
      if (data.status === 1 && data.product?.product_name) {
        return data.product.product_name;
      }
    } catch (_) {
      // ネットワークエラーは無視
    }
    return null;
  };

  const handleBarcodeScanned = async ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);

    const name = await fetchProductName(data);
    navigation.replace("AddItem", {
      barcode: data,
      name: name ?? undefined,
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "qr",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* オーバーレイ */}
      <View style={styles.overlay}>
        <View style={styles.overlayDark} />
        <View style={styles.scanRow}>
          <View style={styles.overlayDark} />
          {/* スキャン枠 */}
          <View style={styles.scanWindow}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlayDark} />
        </View>
        <View style={[styles.overlayDark, styles.bottomArea]}>
          <Text style={styles.hint}>
            {scanned
              ? "読み取り中..."
              : "バーコードをフレーム内に合わせてください"}
          </Text>
          <View style={styles.controls}>
            {/* ライトボタン */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setTorch(!torch)}
            >
              <Text style={styles.controlIcon}>{torch ? "🔦" : "💡"}</Text>
              <Text style={styles.controlLabel}>ライト</Text>
            </TouchableOpacity>

            {/* 手動入力ボタン */}
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => navigation.replace("AddItem", {})}
            >
              <Text style={styles.manualBtnText}>✏️ 手動入力</Text>
            </TouchableOpacity>

            {/* 再スキャンボタン */}
            {scanned && (
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.controlIcon}>🔄</Text>
                <Text style={styles.controlLabel}>再スキャン</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    gap: 16,
  },
  permText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  permBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  permBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  overlay: { ...StyleSheet.absoluteFill },
  overlayDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  scanRow: { flexDirection: "row", height: SCAN_SIZE },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#52B788",
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  bottomArea: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 24,
    gap: 24,
  },
  hint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  controlBtn: { alignItems: "center", gap: 4 },
  controlIcon: { fontSize: 24 },
  controlLabel: { color: "#FFF", fontSize: 12 },
  manualBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  manualBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
});
