
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
