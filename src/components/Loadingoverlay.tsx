import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const COLORS = {
  accent: "#52B788",
  card: "#FFFFFF",
  text: "#1A1A2E",
};

export default function LoadingOverlay({
  visible,
  message = "登録中｀",
}: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: "center",
    gap: 14,
    minWidth: 160,
    elevation: 6,
  },
  text: { fontSize: 14, fontWeight: "700", color: COLORS.text },
});
