// app/main/(tabs)/_layout.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const ACCENT = "#8B4A9C";
const BG = "#1A0F1F";
const ICON = "#F0E8F5";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: ICON,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: "#3E2A47",
          height: Platform.select({ ios: 84, android: 66 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 22, android: 10 }),
        },
      }}
    >
      {/* 1) HOME (izquierda) -> app/main/(tabs)/home.tsx */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 2) EXPLORE -> app/main/(tabs)/explore.tsx */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Feather name="compass" size={size} color={color} />,
        }}
      />

      {/* 3) SEARCH (centro) -> Crea app/main/(tabs)/search.tsx */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
        }}
      />

      {/* 4) LIVE -> app/main/(tabs)/live.tsx */}
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="soccer" size={size} color={color} />
          ),
        }}
      />

      {/* 5) CHATS -> app/main/(tabs)/chats.tsx */}
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 6) PROFILE (derecha) -> app/main/(tabs)/profile.tsx */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
