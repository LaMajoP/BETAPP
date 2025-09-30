import React, { useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
// Importa las funciones de supabase que vas a crear
import { useAuth } from "../../../contexts/AuthContext";
import { getMessagesForChat, searchUsersByEmail, sendMessage, startChatWithUser } from "../../../utils/supabase";


type UserResult = { id: string; email: string };
type MessageResult = { id: string; sender_id: string; content: string };

const ChatsTab = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResult[]>([]);
  const [message, setMessage] = useState("");

  // Buscar usuarios por email
  const handleSearch = async () => {
    if (!user) return;
    const users = await searchUsersByEmail(search, user.id);
    setResults(users);
  };

  // Seleccionar usuario y crear/iniciar chat
  const handleSelectUser = async (userObj: UserResult) => {
    if (!user) return;
    setSelectedUser(userObj);
    const chat = await startChatWithUser(user.id, userObj.id);
    setChatId(chat.id);
    const msgs = await getMessagesForChat(chat.id);
    setMessages(msgs);
  };

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !chatId) return;
    await sendMessage(chatId, user.id, message);
    setMessage("");
    const msgs = await getMessagesForChat(chatId);
    setMessages(msgs);
  };

  // Paleta de colores (ajusta según tu app)
  const colors = {
    background: '#1A0F1F', // BG
    text: '#F0E8F5',      // TEXT
    muted: '#9B7DA8',     // MUTED
    card: '#2D1B35',      // BG_MID
    inputBg: '#2D1B35',   // BG_MID
    border: '#3E2A47',    // BORDER
    accent: '#8B4A9C',    // ACCENT
    primary: '#8B4A9C',   // ACCENT
    userMsg: '#B8336A',   // RED
    otherMsg: '#2D1B35',  // BG_MID
    shadow: '#00000040',
    green: '#7B4397',     // GREEN
    red: '#B8336A',       // RED
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {!chatId ? (
        <>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: 'bold', marginBottom: 18, letterSpacing: 1 }}>Buscar usuario</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TextInput
              placeholder="Buscar por correo..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              style={{ backgroundColor: colors.inputBg, color: colors.text, borderRadius: 16, padding: 12, flex: 1, borderWidth: 1, borderColor: colors.border, fontSize: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
            />
            <TouchableOpacity onPress={handleSearch} style={{ marginLeft: 10, backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 20, justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Buscar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectUser(item)} style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 }}>
                <Image source={require('../../../assets/images/react-logo.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12, borderWidth: 2, borderColor: colors.primary }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>{item.email}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>No se encontraron usuarios</Text>}
          />
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => {
              setChatId(null);
              setSelectedUser(null);
              setMessages([]);
              setMessage("");
            }}
            style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 }}
          >
            <Text style={{ color: colors.muted, fontWeight: 'bold', fontSize: 15 }}>← Volver</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' }}>
            <Image source={require('../../../assets/images/react-logo.png')} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.primary, marginRight: 10 }} />
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Chat con</Text>
            <Text style={{ color: colors.accent, fontSize: 20, marginLeft: 8, fontWeight: 'bold' }}>{selectedUser?.email}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 10, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ alignSelf: item.sender_id === user?.id ? 'flex-end' : 'flex-start', backgroundColor: item.sender_id === user?.id ? colors.userMsg : colors.otherMsg, borderRadius: 14, padding: 10, marginVertical: 4, maxWidth: '80%', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 2 }}>
                  <Text style={{ color: colors.text, fontSize: 15 }}>{item.content}</Text>
                </View>
              )}
              inverted
              ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
              ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>No hay mensajes aún</Text>}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 4 }}>
            <TextInput
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.muted}
              value={message}
              onChangeText={setMessage}
              style={{ backgroundColor: colors.inputBg, color: colors.text, borderRadius: 16, padding: 12, flex: 1, borderWidth: 1, borderColor: colors.border, fontSize: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
            />
            <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 10, backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 20, justifyContent: "center", alignItems: 'center', height: 48, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ChatsTab;
