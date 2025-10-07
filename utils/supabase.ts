export async function deleteComment(comment_id: string) {
  const { error } = await supabase
    .from('game_comments')
    .delete()
    .eq('id', comment_id);
  if (error) throw error;
}
// ====== HELPERS: COMMENTS ======
export async function addComment(game_id: string, user_id: string, username: string, text: string) {
  if (!text.trim()) throw new Error('Comentario vacío');
  const { error } = await supabase
    .from('game_comments')
    .insert({ game_id, user_id, username, text });
  if (error) throw error;
}

export async function listComments(game_id: string) {
  const { data, error } = await supabase
    .from('game_comments')
    .select('id, user_id, username, text, created_at')
    .eq('game_id', game_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// ====== CLIENT ======
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://your-project.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_API_KEY ?? "your-anon-key";

console.log("Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("Supabase Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing");

if (supabaseUrl === "https://your-project.supabase.co" || supabaseAnonKey === "your-anon-key") {
  console.warn("⚠️  Supabase credentials not configured! Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_API_KEY in your .env file");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ====== HELPERS: GAMES ======
export async function listGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGame(input: {
  title: string;
  description?: string;
  image_url?: string;
  created_by: string;
  min_bet?: number;
  max_bet?: number;
}) {
  const { data, error } = await supabase
    .from('games')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function editGame(
  gameId: string,
  data: {
    title?: string;
    image_url?: string;
    description?: string;
    min_bet?: number;
    max_bet?: number;
  }
) {
  const { error } = await supabase
    .from('games')
    .update(data)
    .eq('id', gameId);
  if (error) throw error;
}

export async function deleteGame(gameId: string) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);
  if (error) throw error;
}

export async function setGameBetLimits(gameId: string, min_bet: number, max_bet: number) {
  const { error } = await supabase
    .from('games')
    .update({ min_bet, max_bet })
    .eq('id', gameId);
  if (error) throw error;
}

export async function rateGame(game_id: string, user_id: string, stars: number) {
  // Asegura que el score esté entre 1 y 5
  const score = Math.max(1, Math.min(5, Math.round(stars)));
  const { error } = await supabase
    .from('game_ratings')
    .upsert({ game_id, user_id, stars: score });
  if (error) throw error;
}

// ====== HELPERS: STORAGE (CHAT IMAGES) ======
export async function uploadChatImageBuffer(localUri: string, userId: string, chatId: string): Promise<string | null> {
  try {
    const response = await fetch(localUri);
    const buffer = await response.arrayBuffer();
    const fileName = `${chatId}/${userId}_${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });
    if (uploadError) {
      console.warn("Chat image upload error:", uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from("chat-images").getPublicUrl(fileName);
    return data.publicUrl ?? null;
  } catch (e) {
    console.warn("Chat image upload exception:", e);
    return null;
  }
}

export async function uploadChatImage(uri: string, userId: string, chatId: string): Promise<string> {
  const fileExt = uri.split('.').pop();
  const fileName = `${chatId}_${userId}_${Date.now()}.${fileExt}`;
  const path = `chat-images/${fileName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from('chat-images').upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: blob.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}

// ====== HELPERS: CHATS ======
export async function searchUsersByEmail(email: string, excludeId?: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', `%${email}%`)
    .neq('id', excludeId ?? '')
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function startChatWithUser(user1_id: string, user2_id: string) {
  const { data: existing, error: err1 } = await supabase
    .from('chats')
    .select('*')
    .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
    .limit(1);
  if (err1) throw err1;
  if (existing && existing.length > 0) return existing[0];

  const { data, error } = await supabase
    .from('chats')
    .insert([{ user1_id, user2_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMessagesForChat(chat_id: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chat_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(chat_id: string, sender_id: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert([{ chat_id, sender_id, content }]);
  if (error) throw error;
}

// ====== HELPERS: WALLET / BETS ======
export async function updateBalance(userId: string, amount: number) {
  const { error } = await supabase.rpc('increment_balance', { user_id: userId, amount });
  if (error) throw error;
}

export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function placeBet(userId: string, gameId: string, amount: number) {
  const balance = await getBalance(userId);
  if (balance < amount) throw new Error('Saldo insuficiente');

  const { error } = await supabase
    .from('bets')
    .insert({ user_id: userId, game_id: gameId, amount });
  if (error) throw error;

  await updateBalance(userId, -amount);
}

/**
 * Apuesta con resultado win/lose y retorno 2x (incluye la apuesta).
 * Lógica: primero se descuenta la apuesta. Si gana, se abona 2*amount (stake+ganancia).
 * Si pierde, no se reembolsa y se acredita al creador del juego.
 */
export async function betOnGame(clientId: string, game: any, amount: number) {
  if (amount < game.min_bet || amount > game.max_bet) throw new Error('Monto fuera de límites');

  const clientBalance = await getBalance(clientId);
  if (clientBalance < amount) throw new Error('Saldo insuficiente');

  const win = Math.random() < 0.5;

  // Registrar apuesta
  await supabase.from('bets').insert({
    user_id: clientId,
    game_id: game.id,
    amount,
    result: win ? 'WIN' : 'LOSE',
  });

  // Descontar stake primero
  await updateBalance(clientId, -amount);

  if (win) {
    // Retorno total 2x (stake + ganancia)
    await updateBalance(clientId, amount * 2);
  } else {
    // El admin/creador recibe lo perdido
    await updateBalance(game.created_by, amount);
  }

  return win;
}
