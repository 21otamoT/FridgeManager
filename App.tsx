// App.tsx
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import HomeScreen from "./src/screens/HomeScreen";
import AlertScreen from "./src/screens/AlertScreen";
import ScanScreen from "./src/screens/ScanScreen";
import AddItemScreen from "./src/screens/AddItemScreen";
import ItemDetailScreen from "./src/screens/ItemDetailScreen";
import MobileAds from "react-native-google-mobile-ads";
import Constants from "expo-constants";
import { NavigationBar } from "expo-navigation-bar";

export type RootStackParamList = {
  Main: undefined;
  Scan: undefined;
  AddItem: { barcode?: string; name?: string; needsRegistration?: boolean };
  ItemDetail: { itemId: string };
};

export type TabParamList = {
  Home: undefined;
  Alert: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#52B788",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "冷蔵庫" }}
      />
      <Tab.Screen
        name="Alert"
        component={AlertScreen}
        options={{ tabBarLabel: "アラート" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    const isExpoGo = Constants.appOwnership === "expo";
    if (isExpoGo) {
      console.log("Running in Expo Go, skipping AdMob initialization");
      return;
    }
    // 広告の初期化
    MobileAds()
      .initialize()
      .then(() => {
        // 初期化完了後の処理
        console.log("AdMob initialized");
      });
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationBar hidden={true} />
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#1B4332" },
              headerTintColor: "#FFFFFF",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          >
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: "バーコードスキャン" }}
            />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{ title: "食品を追加" }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ title: "食品詳細" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
