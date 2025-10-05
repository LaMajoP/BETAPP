import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
// Importa las funciones de supabase que vas a crear
import { useAuth } from "../../../contexts/AuthContext";
import { getMessagesForChat, searchUsersByEmail, sendMessage, startChatWithUser, uploadChatImageBuffer } from "../../../utils/supabase";


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
  // Nuevo estado para imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [sendingImage, setSendingImage] = useState(false);
  const [imageError, setImageError] = useState("");

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
              renderItem={({ item }) => {
                const isImage = typeof item.content === 'string' && (item.content.startsWith('http://') || item.content.startsWith('https://')) && (item.content.endsWith('.jpg') || item.content.endsWith('.jpeg') || item.content.endsWith('.png') || item.content.endsWith('.webp'));
                return (
                  <View style={{ alignSelf: item.sender_id === user?.id ? 'flex-end' : 'flex-start', backgroundColor: item.sender_id === user?.id ? colors.userMsg : colors.otherMsg, borderRadius: 14, padding: 10, marginVertical: 4, maxWidth: '80%', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 2 }}>
                    {isImage ? (
                      <Image source={{ uri: item.content }} style={{ width: 180, height: 180, borderRadius: 12 }} resizeMode="cover" />
                    ) : (
                      <Text style={{ color: colors.text, fontSize: 15 }}>{item.content}</Text>
                    )}
                  </View>
                );
              }}
              inverted
              ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
              ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>No hay mensajes aún</Text>}
            />
          </View>
          {/* Vista previa y envío de imagen */}
          {selectedImage ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Image source={{ uri: selectedImage.uri }} style={{ width: 80, height: 80, borderRadius: 12, marginRight: 10 }} />
              <TouchableOpacity
                onPress={async () => {
                  if (!user || !chatId || !selectedImage) return;
                  setSendingImage(true);
                  setImageError("");
                  try {
                    const imageUrl = await uploadChatImageBuffer(selectedImage.uri, user.id, chatId);
                    if (!imageUrl) {
                      setImageError("No se pudo subir la imagen. Verifica tu conexión y los permisos del bucket.");
                      setSendingImage(false);
                      return;
                    }
                    await sendMessage(chatId, user.id, imageUrl);
                    setSelectedImage(null);
                    const msgs = await getMessagesForChat(chatId);
                    setMessages(msgs);
                  } catch (e) {
                    setImageError(typeof e === 'string' ? `Error: ${e}` : (e && typeof e === 'object' && 'message' in e ? `Error: ${e.message}` : `Error al subir la imagen. Verifica tu conexión y los permisos del bucket.`));
                  }
                  setSendingImage(false);
                }}
                style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 }}
                disabled={sendingImage}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{sendingImage ? "Enviando..." : "Enviar imagen"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSelectedImage(null); setImageError(""); }}
                style={{ backgroundColor: colors.red, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}
                disabled={sendingImage}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              {imageError ? (
                <Text style={{ color: colors.red, marginLeft: 10 }}>{imageError}</Text>
              ) : null}
            </View>
          ) : (
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
              <TouchableOpacity onPress={async () => {
                if (!user || !chatId) return;
                try {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.7,
                  });
                  if (!result.canceled && result.assets && result.assets.length > 0) {
                    setSelectedImage(result.assets[0]);
                  }
                } catch (e) {
                  // Puedes mostrar un error aquí
                }
              }} style={{ marginLeft: 10, backgroundColor: colors.green, borderRadius: 16, paddingHorizontal: 16, justifyContent: "center", alignItems: 'center', height: 48, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Imagen</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default ChatsTab;
