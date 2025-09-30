import React, { useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {!chatId ? (
        <>
          <TextInput
            placeholder="Buscar por correo..."
            value={search}
            onChangeText={setSearch}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 8 }}
          />
          <TouchableOpacity onPress={handleSearch} style={{ marginBottom: 8 }}>
            <Text>Buscar</Text>
          </TouchableOpacity>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectUser(item)}>
                <Text>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text>Chat con: {selectedUser?.email}</Text>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={{ marginVertical: 2, color: item.sender_id === user?.id ? "blue" : "black" }}>
                {item.content}
              </Text>
            )}
            style={{ flex: 1, marginVertical: 8 }}
          />
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder="Escribe un mensaje..."
              value={message}
              onChangeText={setMessage}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, flex: 1 }}
            />
            <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 8, justifyContent: "center" }}>
              <Text>Enviar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ChatsTab;
