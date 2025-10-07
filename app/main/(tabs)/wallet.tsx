import { useAuth } from "@/contexts/AuthContext";
import { getBalance, listGames, placeBet, updateBalance } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const BG = "#1A0F1F", TEXT = "#F0E8F5", ACCENT = "#8B4A9C", MUTED = "#9B7DA8";

export default function WalletTab() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [bal, gs] = await Promise.all([getBalance(user.id), listGames()]);
        setBalance(bal);
        setGames(gs);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDeposit = async () => {
    setError("");
    if (!user?.id) return setError("Usuario no válido");
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Ingresa un monto válido (> 0)");
    try {
      await updateBalance(user.id, amt);
      setBalance(await getBalance(user.id));
      setAmount("");
    } catch (e: any) {
      setError(e.message ?? "Error al cargar saldo");
    }
  };

  const handleWithdraw = async () => {
    setError("");
    if (!user?.id) return setError("Usuario no válido");
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Ingresa un monto válido (> 0)");
    try {
      await updateBalance(user.id, -amt);
      setBalance(await getBalance(user.id));
      setAmount("");
    } catch (e: any) {
      setError(e.message ?? "Error al retirar");
    }
  };

  const handleBet = async () => {
    setError("");
    if (!selectedGame) return;
    if (!user?.id) return setError("Usuario no válido");
    const amt = parseFloat(betAmount);
    if (!Number.isFinite(amt)) return setError("Monto inválido");
    if (amt < selectedGame.min_bet || amt > selectedGame.max_bet)
      return setError(`La apuesta debe ser entre ${selectedGame.min_bet} y ${selectedGame.max_bet}`);
    try {
      await placeBet(user.id, selectedGame.id, amt);
      setBalance(await getBalance(user.id));
      setBetAmount("");
      setSelectedGame(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.h1}>Wallet</Text>
      <Text style={styles.balance}>Saldo: ${balance.toFixed(2)}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Monto"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Pressable style={styles.btn} onPress={handleDeposit}>
          <Text style={styles.btnText}>Cargar</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={handleWithdraw}>
          <Text style={styles.btnText}>Descargar</Text>
        </Pressable>
      </View>
      <Text style={styles.h2}>Apostar en juegos</Text>
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={games}
          keyExtractor={g => g.id}
          renderItem={({ item }) => (
            <Pressable style={styles.gameCard} onPress={() => setSelectedGame(item)}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameLimits}>Min: ${item.min_bet} / Max: ${item.max_bet}</Text>
            </Pressable>
          )}
        />
      )}
      {selectedGame && (
        <View style={styles.betBox}>
          <Text style={styles.h2}>Apostar en: {selectedGame.title}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Monto (${selectedGame.min_bet} - ${selectedGame.max_bet})`}
            keyboardType="numeric"
            value={betAmount}
            onChangeText={setBetAmount}
          />
          <Pressable style={styles.btn} onPress={handleBet}>
            <Text style={styles.btnText}>Apostar</Text>
          </Pressable>
        </View>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: BG, padding: 16 },
  h1: { color: TEXT, fontSize: 22, fontWeight: "800", marginBottom: 8 },
  h2: { color: ACCENT, fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 8 },
  balance: { color: TEXT, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: { flex: 1, backgroundColor: "#2D1B35", color: TEXT, borderRadius: 12, paddingHorizontal: 10, marginRight: 8, borderWidth: 1, borderColor: ACCENT },
  btn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  btnText: { color: "#fff", fontWeight: "800" },
  gameCard: { backgroundColor: "#2D1B35", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: ACCENT },
  gameTitle: { color: TEXT, fontSize: 16, fontWeight: "700" },
  gameLimits: { color: MUTED, fontSize: 12 },
  betBox: { backgroundColor: "#26172E", borderRadius: 12, padding: 12, marginTop: 10 },
  error: { color: "#B8336A", marginTop: 10, fontWeight: "700" },
});
