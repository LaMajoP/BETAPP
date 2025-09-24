// app/main/(tabs)/index.tsx
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ACCENT = "#8B4A9C";
const BG = "#1A0F1F";
const BG_MID = "#2D1B35";
const TEXT = "#F0E8F5";
const MUTED = "#9B7DA8";
const BORDER = "#3E2A47";

type RecreationalBet = {
  id: string;
  category: string;
  title: string;
  description: string;
  timeLeft: string;
  img: string;
  options: { name: string; odds: number; icon: string }[];
  participants: number;
  prize: string;
};

const DATA: RecreationalBet[] = [
  {
    id: "1",
    category: "🎬 Entertainment",
    title: "Oscars 2026 Best Picture",
    description: "Which movie will take home the biggest prize?",
    timeLeft: "Ends in 6 months",
    img: "https://images.unsplash.com/photo-1489599743717-bf1e49c5e837?q=80&w=1200",
    options: [
      { name: "Drama A", odds: 2.1, icon: "🏆" },
      { name: "Thriller B", odds: 3.2, icon: "🎭" },
      { name: "Comedy C", odds: 4.5, icon: "😄" }
    ],
    participants: 12847,
    prize: "$50K Pool"
  },
  {
    id: "2",
    category: "🎮 Gaming",
    title: "Next AAA Game Release",
    description: "Which studio will announce their game first?",
    timeLeft: "Ends in 2 weeks",
    img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200",
    options: [
      { name: "Studio X", odds: 1.8, icon: "🎯" },
      { name: "Studio Y", odds: 2.9, icon: "🚀" },
      { name: "Studio Z", odds: 3.7, icon: "⭐" }
    ],
    participants: 8932,
    prize: "$25K Pool"
  },
  {
    id: "3",
    category: "🌟 Pop Culture",
    title: "Celebrity Surprise Announcement",
    description: "Who will make the biggest announcement this month?",
    timeLeft: "Ends in 5 days",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200",
    options: [
      { name: "Celebrity A", odds: 2.3, icon: "💫" },
      { name: "Celebrity B", odds: 1.9, icon: "🌟" },
      { name: "Celebrity C", odds: 4.1, icon: "✨" }
    ],
    participants: 15623,
    prize: "$75K Pool"
  },
  {
    id: "4",
    category: "🚀 Tech",
    title: "Next Big Tech Innovation",
    description: "Which technology will revolutionize 2026?",
    timeLeft: "Ends in 3 months",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1200",
    options: [
      { name: "AI Assistant", odds: 1.6, icon: "🤖" },
      { name: "VR Platform", odds: 3.1, icon: "🥽" },
      { name: "Crypto Tech", odds: 5.2, icon: "₿" }
    ],
    participants: 9876,
    prize: "$40K Pool"
  }
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>🎲 Featured Recreational Bets</Text>
      <Text style={styles.subtitle}>Discover exciting predictions & win amazing prizes!</Text>

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.img }} style={styles.image} />
            <View style={styles.cardOverlay}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.prize}>{item.prize}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.betTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              
              <View style={styles.statsRow}>
                <Text style={styles.participants}>👥 {item.participants.toLocaleString()} players</Text>
                <Text style={styles.timeLeft}>{item.timeLeft}</Text>
              </View>

              <View style={styles.optionsRow}>
                {item.options.map((option, index) => (
                  <Pressable 
                    key={index}
                    style={({ pressed }) => [styles.optionBtn, pressed && styles.optionPressed]}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionOdds}>{option.odds.toFixed(1)}x</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.actionRow}>
                <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}>
                  <Text style={styles.primaryText}>🎯 Place Bet</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}>
                  <Text style={styles.secondaryText}>📊 Stats</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 16, paddingTop: 8 },
  title: { 
    color: TEXT, 
    fontSize: 24, 
    fontWeight: "800", 
    marginVertical: 8, 
    alignSelf: "center",
    textAlign: "center"
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500"
  },

  card: {
    backgroundColor: BG_MID,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  image: { 
    width: "100%", 
    height: 180 
  },
  cardOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  category: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prize: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    backgroundColor: ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBody: { padding: 16 },
  betTitle: { 
    color: TEXT, 
    fontSize: 18, 
    fontWeight: "800",
    marginBottom: 6 
  },
  description: { 
    color: MUTED, 
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12 
  },
  
  statsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  participants: { 
    color: ACCENT, 
    fontSize: 12, 
    fontWeight: "600" 
  },
  timeLeft: { 
    color: MUTED, 
    fontSize: 12,
    fontWeight: "500" 
  },

  optionsRow: { 
    flexDirection: "row", 
    marginBottom: 16,
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "#1A0F1F",
    borderColor: BORDER,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    minHeight: 70,
  },
  optionPressed: { 
    opacity: 0.7,
    transform: [{ scale: 0.98 }]
  },
  optionIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionName: { 
    color: TEXT, 
    fontWeight: "600",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
  },
  optionOdds: {
    color: ACCENT,
    fontWeight: "800",
    fontSize: 13,
  },

  actionRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 12 
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    elevation: 2,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryPressed: { 
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  primaryText: { 
    color: "#fff", 
    fontWeight: "800",
    fontSize: 15,
  },

  secondaryBtn: {
    width: 100,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 74, 156, 0.1)",
  },
  secondaryPressed: { 
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  secondaryText: { 
    color: TEXT, 
    fontWeight: "700",
    fontSize: 13,
  },
});
