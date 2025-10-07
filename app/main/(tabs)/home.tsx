import { AuthContext } from "@/contexts/AuthContext";
import { addComment, betOnGame, createGame, deleteComment, deleteGame, editGame, listComments, listGames, rateGame, uploadChatImageBuffer } from "@/utils/supabase";
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";

const ACCENT = "#8B4A9C", BG = "#1A0F1F", BG_MID = "#2D1B35", TEXT = "#F0E8F5", MUTED = "#9B7DA8", BORDER = "#3E2A47";

export default function HomeScreen() {
  // ...existing code...
  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Seguro que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setComments(comments => comments.filter(c => c.id !== commentId));
            } catch (e) {
              // Optionally show error
            }
          },
        },
      ]
    );
  };
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentGameId, setCommentGameId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Load comments for a game
  const openComments = async (gameId: string) => {
    setCommentGameId(gameId);
    setCommentModalOpen(true);
    setCommentLoading(true);
    try {
      setComments(await listComments(gameId));
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user?.id || !commentGameId || !newComment.trim()) return;
    try {
      await addComment(commentGameId, user.id, user.email ?? "", newComment.trim());
      setNewComment("");
      setComments(await listComments(commentGameId));
    } catch (e) {
      // Optionally show error
    }
  };
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'ADMIN';
  const [games, setGames] = useState<any[]>([]);
  // Track which games the user has rated (by gameId)
  const [ratedGames, setRatedGames] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // modal crear
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [minBet, setMinBet] = useState("");
  const [maxBet, setMaxBet] = useState("");

  // modal editar
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editMinBet, setEditMinBet] = useState("");
  const [editMaxBet, setEditMaxBet] = useState("");

  const [betAmount, setBetAmount] = useState<{ [key: string]: string }>({});
  // Feedback por juego: { [gameId]: { result, win, error } }
  const [betFeedback, setBetFeedback] = useState<Record<string, { result?: string; win?: boolean; error?: string }>>({});

  const load = async () => {
    setLoading(true);
    try {
      const loadedGames = await listGames();
      setGames(loadedGames);
      // Build ratedGames map for CLIENT
      if (user && user.rol !== 'ADMIN') {
        const userRatings: Record<string, number> = {};
        loadedGames.forEach(g => {
          if (g.my_rating) userRatings[g.id] = g.my_rating;
        });
        setRatedGames(userRatings);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    if (!user?.id || !title.trim()) return;
    const min = parseFloat(minBet);
    const max = parseFloat(maxBet);
    await createGame({
      title: title.trim(),
      description: desc.trim() || undefined,
      image_url: img.trim() || undefined,
      created_by: user.id,
      min_bet: Number.isFinite(min) ? min : undefined,
      max_bet: Number.isFinite(max) ? max : undefined,
    });
    setOpen(false); setTitle(""); setDesc(""); setImg(""); setMinBet(""); setMaxBet("");
    await load();
  };

  const onRate = async (gameId: string, stars: number) => {
    if (!user?.id || isAdmin) return;
    // Prevent rating again if already rated
    if (ratedGames[gameId]) return;
    try {
      await rateGame(gameId, user.id, stars);
      setRatedGames(s => ({ ...s, [gameId]: stars }));
      // Optionally reload games to update average, etc
      setGames(await listGames());
    } catch {}
  };

  // Eliminar juego
  const onDelete = async (gameId: string) => {
    await deleteGame(gameId);
    await load();
  };

  // Abrir modal de edición
  const openEditModal = (game: any) => {
    setEditId(game.id);
    setEditTitle(game.title);
    setEditDesc(game.description ?? "");
    setEditImg(game.image_url ?? "");
    setEditMinBet(game.min_bet?.toString() ?? "");
    setEditMaxBet(game.max_bet?.toString() ?? "");
    setEditOpen(true);
  };

  // Guardar edición
  const onEdit = async () => {
    if (!editId || !editTitle.trim()) return;
    const min = parseFloat(editMinBet);
    const max = parseFloat(editMaxBet);
    await editGame(editId, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      image_url: editImg.trim() || undefined,
      min_bet: Number.isFinite(min) ? min : undefined,
      max_bet: Number.isFinite(max) ? max : undefined,
    });
    setEditOpen(false); setEditId(null); setEditTitle(""); setEditDesc(""); setEditImg(""); setEditMinBet(""); setEditMaxBet("");
    await load();
  };

  // Subir imagen en crear juego
  const pickImageForCreate = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0 && user?.id) {
      const asset = result.assets[0];
      const url = await uploadChatImageBuffer(asset.uri, user.id, 'game');
      if (url) setImg(url);
    }
  };
  // Subir imagen en editar juego
  const pickImageForEdit = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0 && user?.id) {
      const asset = result.assets[0];
      const url = await uploadChatImageBuffer(asset.uri, user.id, 'game');
      if (url) setEditImg(url);
    }
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
                {/* Comment button/icon */}
                <Pressable
                  style={{ position: 'absolute', top: 10, right: 10, backgroundColor: ACCENT, borderRadius: 20, padding: 6, zIndex: 2 }}
                  onPress={() => openComments(item.id)}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💬</Text>
                </Pressable>
                <Text style={styles.betTitle}>{item.title}</Text>
                {!!item.description && <Text style={styles.description}>{item.description}</Text>}
                {/* rating 1–3 estrellas */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  {[1,2,3,4,5].map((n) => {
                    // Use ratedGames for CLIENT, item.my_rating for ADMIN
                    const selected = (user && user.rol !== 'ADMIN') ? ratedGames[item.id] === n : item.my_rating === n;
                    const alreadyRated = (user && user.rol !== 'ADMIN') ? !!ratedGames[item.id] : false;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => {
                          if (!alreadyRated) onRate(item.id, n);
                        }}
                        style={[styles.star, selected && { borderColor: ACCENT, backgroundColor: ACCENT+"30" }]}
                        disabled={!user || isAdmin || alreadyRated}
                      >
                        <Text style={{ color: n <= ((user && user.rol !== 'ADMIN') ? (ratedGames[item.id] ?? 0) : (item.my_rating ?? 0)) ? "#FFD700" : "#fff", fontSize: 18 }}>★</Text>
                        <Text style={{ color: "#fff", fontSize: 12 }}>{n}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {/* Botones ADMIN */}
                {isAdmin && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <Pressable style={[styles.createBtn, { backgroundColor: '#7B4397' }]} onPress={() => openEditModal(item)}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>Edit</Text>
                    </Pressable>
                    <Pressable style={[styles.createBtn, { backgroundColor: '#B8336A' }]} onPress={() => onDelete(item.id)}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>Delete</Text>
                    </Pressable>
                  </View>
                )}
                {/* Botón y campo de apuesta (usuarios normales) */}
                {!isAdmin && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: ACCENT, fontWeight: "700" }}>Apostar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`Monto (${item.min_bet} - ${item.max_bet})`}
                      keyboardType="numeric"
                      value={betAmount[item.id] || ""}
                      onChangeText={v => setBetAmount({ ...betAmount, [item.id]: v })}
                    />
                    <Pressable
                      style={styles.createBtn}
                      onPress={async () => {
                        setBetFeedback((s) => ({ ...s, [item.id]: {} }));
                        if (!user?.id) {
                          setBetFeedback((s) => ({ ...s, [item.id]: { error: "Usuario no válido" } }));
                          return;
                        }
                        const raw = betAmount[item.id];
                        const amt = parseFloat(raw);
                        if (!Number.isFinite(amt)) {
                          setBetFeedback((s) => ({ ...s, [item.id]: { error: "Monto inválido" } }));
                          return;
                        }
                        try {
                          const win = await betOnGame(user.id, item, amt);
                          setBetFeedback((s) => ({ ...s, [item.id]: { result: win ? "¡Ganaste el doble!" : "Perdiste la apuesta", win } }));
                          await load(); // refresca juegos y saldos
                        } catch (e: any) {
                          setBetFeedback((s) => ({ ...s, [item.id]: { error: e.message } }));
                        }
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "800" }}>Apostar</Text>
                    </Pressable>
                    {/* Mensajes por juego */}
                    {(() => {
                      const fb = betFeedback[item.id];
                      return (
                        <>
                          {!!fb?.result && (
                            <Text style={{ color: fb.win ? "green" : "red" }}>{fb.result}</Text>
                          )}
                          {!!fb?.error && <Text style={{ color: "red" }}>{fb.error}</Text>}
                        </>
                      );
                    })()}
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
      {/* Modal crear juego (solo ADMIN) */}
      {/* Modal comentarios */}
      <Modal visible={commentModalOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { maxHeight: 500 }]}> 
            <Text style={styles.modalTitle}>Comentarios</Text>
            {commentLoading ? <ActivityIndicator /> : (
              <FlatList
                data={comments}
                keyExtractor={c => c.id}
                style={{ maxHeight: 220 }}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: ACCENT, fontWeight: '700' }}>{item.username ?? 'Usuario'}</Text>
                      <Text style={{ color: TEXT }}>{item.text}</Text>
                    </View>
                    {user?.id === item.user_id && (
                      <Pressable
                        style={{ marginLeft: 8, padding: 4, borderRadius: 8, backgroundColor: '#B8336A' }}
                        onPress={() => handleDeleteComment(item.id)}
                      >
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Eliminar</Text>
                      </Pressable>
                    )}
                  </View>
                )}
                ListEmptyComponent={<Text style={{ color: MUTED, textAlign: 'center', marginTop: 20 }}>Sin comentarios</Text>}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Escribe un comentario..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <Pressable style={styles.createBtn} onPress={handleAddComment}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Enviar</Text>
              </Pressable>
            </View>
            <Pressable style={[styles.createBtn, { backgroundColor: '#3E2A47', marginTop: 10 }]} onPress={() => setCommentModalOpen(false)}>
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Game</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#9B7DA8" value={title} onChangeText={setTitle} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Image URL (optional)" placeholderTextColor="#9B7DA8" value={img} onChangeText={setImg} />
              <Pressable style={[styles.createBtn, { backgroundColor: '#7B4397' }]} onPress={pickImageForCreate}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Upload</Text>
              </Pressable>
            </View>
            <TextInput style={[styles.input, { height: 90, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor="#9B7DA8" value={desc} onChangeText={setDesc} multiline />
            <TextInput style={styles.input} placeholder="Min bet" keyboardType="numeric" value={minBet} onChangeText={setMinBet} />
            <TextInput style={styles.input} placeholder="Max bet" keyboardType="numeric" value={maxBet} onChangeText={setMaxBet} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable style={[styles.createBtn, { backgroundColor: "#3E2A47" }]} onPress={() => setOpen(false)}><Text style={{ color: "#fff" }}>Cancel</Text></Pressable>
              <Pressable style={styles.createBtn} onPress={onCreate}><Text style={{ color: "#fff", fontWeight: "800" }}>Save</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal editar juego (solo ADMIN) */}
      <Modal visible={editOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Game</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#9B7DA8" value={editTitle} onChangeText={setEditTitle} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Image URL (optional)" placeholderTextColor="#9B7DA8" value={editImg} onChangeText={setEditImg} />
              <Pressable style={[styles.createBtn, { backgroundColor: '#7B4397' }]} onPress={pickImageForEdit}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Upload</Text>
              </Pressable>
            </View>
            <TextInput style={[styles.input, { height: 90, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor="#9B7DA8" value={editDesc} onChangeText={setEditDesc} multiline />
            <TextInput style={styles.input} placeholder="Min bet" keyboardType="numeric" value={editMinBet} onChangeText={setEditMinBet} />
            <TextInput style={styles.input} placeholder="Max bet" keyboardType="numeric" value={editMaxBet} onChangeText={setEditMaxBet} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable style={[styles.createBtn, { backgroundColor: "#3E2A47" }]} onPress={() => setEditOpen(false)}><Text style={{ color: "#fff" }}>Cancel</Text></Pressable>
              <Pressable style={styles.createBtn} onPress={onEdit}><Text style={{ color: "#fff", fontWeight: "800" }}>Save</Text></Pressable>
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
