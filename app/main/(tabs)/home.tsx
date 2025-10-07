import { AuthContext } from "@/contexts/AuthContext";
import { createGame, listGames, rateGame } from "@/utils/supabase";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";

const ACCENT = "#8B4A9C", BG = "#1A0F1F", BG_MID = "#2D1B35", TEXT = "#F0E8F5", MUTED = "#9B7DA8", BORDER = "#3E2A47";

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'ADMIN';
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // modal crear
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");

  const load = async () => {
    setLoading(true);
    try { setGames(await listGames()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    if (!user?.id || !title.trim()) return;
    await createGame({ title: title.trim(), description: desc.trim() || undefined, image_url: img.trim() || undefined, created_by: user.id });
    setOpen(false); setTitle(""); setDesc(""); setImg("");
    await load();
  };

  const onRate = async (gameId: string, stars: 1|2|3) => {
    if (!user?.id) return;
    await rateGame(gameId, user.id, stars);
    // opcional: feedback/UI
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.title}>🎲 Games</Text>
        {isAdmin && (
          <Pressable style={styles.createBtn} onPress={() => setOpen(true)}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>+ Create Game</Text>
          </Pressable>
        )}
      </View>

      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={games}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {!!item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
              <View style={{ padding: 14 }}>
                <Text style={styles.betTitle}>{item.title}</Text>
                {!!item.description && <Text style={styles.description}>{item.description}</Text>}

                {/* rating 1–3 estrellas */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  {[1,2,3].map((n) => (
                    <Pressable key={n} onPress={() => onRate(item.id, n as 1|2|3)} style={styles.star}>
                      <Text style={{ color: "#FFD700", fontSize: 18 }}>★</Text>
                      <Text style={{ color: "#fff", fontSize: 12 }}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal crear juego (solo ADMIN) */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Game</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#9B7DA8" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Image URL (optional)" placeholderTextColor="#9B7DA8" value={img} onChangeText={setImg} />
            <TextInput style={[styles.input, { height: 90, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor="#9B7DA8" value={desc} onChangeText={setDesc} multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable style={[styles.createBtn, { backgroundColor: "#3E2A47" }]} onPress={() => setOpen(false)}><Text style={{ color: "#fff" }}>Cancel</Text></Pressable>
              <Pressable style={styles.createBtn} onPress={onCreate}><Text style={{ color: "#fff", fontWeight: "800" }}>Save</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 16, paddingTop: 8 },
  title: { color: TEXT, fontSize: 22, fontWeight: "900" },
  createBtn: { backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  card: { backgroundColor: BG_MID, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginTop: 14 },
  image: { width: "100%", height: 160 },
  betTitle: { color: TEXT, fontSize: 18, fontWeight: "800" },
  description: { color: MUTED, marginTop: 6 },
  star: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 10, backgroundColor: "#26172E" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: BG_MID, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 14, gap: 10 },
  modalTitle: { color: TEXT, fontSize: 16, fontWeight: "900", textAlign: "center" },
  input: { height: 46, borderRadius: 12, backgroundColor: "#2D1B35", borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, color: TEXT },
});
