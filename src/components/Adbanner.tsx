// src/components/Adbanner.tsx
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import Constants from "expo-constants";

// 💡 EXPO_PUBLIC_ をつけた環境変数は、コード内でそのまま参照可能
const adUnitId = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || "";
const { width: windowWidth } = Dimensions.get("window");

export default function AdBanner() {
  const isExpoGo = Constants.appOwnership === "expo";

  if (isExpoGo) {
    return (
      <View>
        <Text>[AdMob Banner (Expo Go)]</Text>
      </View>
    );
  }

  return (
    <BannerAd
      unitId={adUnitId} // 自動的に本番用/テスト用が切り替わる
      size={BannerAdSize.BANNER}
      width={windowWidth}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
