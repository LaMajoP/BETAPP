// app/(auth)/register.tsx
import { router } from "expo-router";
import React, { JSX, useContext, useMemo, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";

const ACCENT = "#6C8DFF";
const BG = "#12151C";
const BG_MID = "#1C2230";
const TEXT = "#E6EAF2";
const MUTED = "#8A93A6";
const BORDER = "#2A3242";

export default function RegisterScreen(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const { register } = useContext(AuthContext);

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okPass = password.length >= 6;
    const match = password === confirm && confirm.length > 0;
    return okName && okEmail && okPass && match;
  }, [name, email, password, confirm]);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 24);

  const handleRegister = async () => {
    if (!canSubmit || isLoading) return;

    setError("");
    setIsLoading(true);
    try {
      console.log("Starting registration process...");
      await register(email.trim(), password);
      console.log("Registration successful, navigating to login...");
      router.replace("/(auth)/login");
    } catch (e: any) {
      console.error("Registration error:", e);
      setError(e?.message ?? "Error al registrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.form}>
        {/* Name */}
        <View className="input-row" style={styles.inputRow}>
          <Text style={styles.leftIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={MUTED}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <Text style={styles.leftIcon}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={MUTED}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <Text style={styles.leftIcon}>*</Text>
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 chars)"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Confirm Password */}
        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <Text style={styles.leftIcon}>*</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        {/* Error */}
        {!!error && (
          <Text style={{ color: "#ff6b6b", marginTop: 10, fontSize: 12 }}>
            {error}
          </Text>
        )}

        {/* Register button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.primaryBtn,
            (!canSubmit || isLoading) && { opacity: 0.5 },
          ]}
          disabled={!canSubmit || isLoading}
          onPress={handleRegister}
        >
          <Text style={styles.primaryText}>
            {isLoading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        {/* Back to login */}
        <Pressable
          onPress={() => router.navigate("/(auth)/login")}
          style={styles.linkRow}
          hitSlop={8}
        >
          <Text style={styles.mutedText}>Already have an account? </Text>
          <Text style={styles.linkText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    alignSelf: "center",
    color: TEXT,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 28,
  },
  form: { width: "100%" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    backgroundColor: BG_MID,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  leftIcon: {
    width: 24,
    textAlign: "center",
    color: MUTED,
    fontWeight: "700",
  },
  input: { flex: 1, color: TEXT, paddingHorizontal: 8 },
  primaryBtn: {
    marginTop: 18,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  linkRow: { alignSelf: "center", marginTop: 14, flexDirection: "row" },
  mutedText: { color: MUTED, fontSize: 12 },
  linkText: { color: ACCENT, fontSize: 12, fontWeight: "800" },
});
