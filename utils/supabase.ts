// Helpers para juegos
export async function listGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGame(input: { title: string; description?: string; image_url?: string; created_by: string; }) {
  const { data, error } = await supabase
    .from('games')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rateGame(game_id: string, user_id: string, stars: 1|2|3) {
  const { error } = await supabase
    .from('game_ratings')
    .upsert({ game_id, user_id, stars });
  if (error) throw error;
}
// Subir imagen de chat a Supabase Storage y devolver la URL pública
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

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

// Buscar usuarios por email (excepto el actual)
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

// Iniciar o buscar chat entre dos usuarios
export async function startChatWithUser(user1_id: string, user2_id: string) {
  // Buscar si ya existe
  const { data: existing, error: err1 } = await supabase
    .from('chats')
    .select('*')
    .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
    .limit(1);
  if (err1) throw err1;
  if (existing && existing.length > 0) return existing[0];
  // Si no existe, crear
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user1_id, user2_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Obtener mensajes de un chat
export async function getMessagesForChat(chat_id: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chat_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}


// Enviar mensaje
export async function sendMessage(chat_id: string, sender_id: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert([{ chat_id, sender_id, content }]);
  if (error) throw error;
}

// Subir imagen de chat a Supabase Storage y devolver la URL
export async function uploadChatImage(uri: string, userId: string, chatId: string): Promise<string> {
  // Obtener el nombre del archivo
  const fileExt = uri.split('.').pop();
  const fileName = `${chatId}_${userId}_${Date.now()}.${fileExt}`;
  const path = `chat-images/${fileName}`;

  // Obtener el blob de la imagen
  const response = await fetch(uri);
  const blob = await response.blob();

  // Subir a Supabase Storage
  const { error } = await supabase.storage.from('chat-images').upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: blob.type,
  });
  if (error) throw error;

  // Obtener la URL pública
  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}
