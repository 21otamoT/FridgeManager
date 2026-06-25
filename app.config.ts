import { ConfigContext, ExpoConfig } from "@expo/config";

console.log("🔥 読み込まれたアプリID:", process.env.EXPO_PUBLIC_ADMOB_APP_ID);
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "FridgeManager",
  slug: "FridgeManager",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yukihiro.FridgeManager",
  },
  android: {
    predictiveBackGestureEnabled: false,
    permissions: [
      "CAMERA",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
    package: "com.yukihiro.FridgeManager",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "@react-native-community/datetimepicker",
    [
      "expo-camera",
      {
        cameraPermission: "バーコードスキャンに使用します",
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "dbe9980d-8193-4196-a89c-42394c8e2b79",
    },
  },
});
