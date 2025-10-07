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

const ACCENT = "#8B4A9C";
const BG = "#1A0F1F";
const BG_MID = "#2D1B35";
const TEXT = "#F0E8F5";
const MUTED = "#9B7DA8";
const BORDER = "#3E2A47";


export default function RegisterScreen(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { register } = useContext(AuthContext);

  const canSubmit = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okPass = password.length >= 6;
    const match = password === confirm && confirm.length > 0;
    return okEmail && okPass && match;
  }, [email, password, confirm]);

  const handleRegister = async () => {
    if (!canSubmit || isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      await register(email.trim(), password);
      router.replace("/(auth)/login");
    } catch (e: any) {
      setError(e?.message ?? "Error al registrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.formCard}>
        <View style={styles.form}>

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
              selectionColor={ACCENT}
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
              selectionColor={ACCENT}
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
              selectionColor={ACCENT}
            />
          </View>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Register button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.primaryBtn, (!canSubmit || isLoading) && { opacity: 0.6 }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  /* Layout base */
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },

  /* Título */
  title: {
    alignSelf: "center",
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 18,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  /* Tarjeta del formulario */
  formCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#26172E", // variación dentro de la paleta
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  form: { width: "100%" },

  /* Inputs */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    backgroundColor: BG_MID,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#4A3355", // un poco más claro que BORDER
    overflow: "hidden",
  },
  leftIcon: {
    width: 26,
    textAlign: "center",
    color: MUTED,
    fontWeight: "800",
    fontSize: 14,
    opacity: 0.95,
  },
  input: {
    flex: 1,
    color: TEXT,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  /* Error */
  errorText: {
    color: "#F9B4CF",
    backgroundColor: "rgba(184, 51, 106, 0.12)",
    borderColor: "rgba(184, 51, 106, 0.35)",
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
  },

  /* Botón primario */
  primaryBtn: {
    marginTop: 18,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* Link inferior */
  linkRow: { alignSelf: "center", marginTop: 14, flexDirection: "row" },
  mutedText: { color: MUTED, fontSize: 12, letterSpacing: 0.2 },
  linkText: { color: ACCENT, fontSize: 12, fontWeight: "900", letterSpacing: 0.3 },
});
