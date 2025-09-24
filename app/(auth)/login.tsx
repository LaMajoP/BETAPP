// app/(auth)/login.tsx
import { AuthContext } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { JSX, useContext, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BG = "#1A0F1F";
const BG_MID = "#2D1B35";
const TEXT = "#F0E8F5";
const MUTED = "#9B7DA8";
const ACCENT = "#8B4A9C";
const BORDER = "#3E2A47";

export default function LoginScreen(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const { login } = useContext(AuthContext);

  const onSignIn = async () => {
    setError("");
    setIsSigningIn(true);

    const loginTimeout = setTimeout(() => {
      console.log("Login timeout - resetting button state");
      setIsSigningIn(false);
      setError("Login timeout - please try again");
    }, 10000);

    try {
      console.log("Starting login process...");
      await login(email, password);
      console.log("Login successful, navigating to home...");
      clearTimeout(loginTimeout);
      router.replace("/main/(tabs)/home");
    } catch (e: any) {
      console.error("Login error:", e);
      clearTimeout(loginTimeout);
      setError(e?.message ?? "Error al iniciar sesión");
    } finally {
      clearTimeout(loginTimeout);
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>BetApp</Text>

      <View style={styles.formCard}>
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputRow}>
            <Text style={styles.leftIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              selectionColor={ACCENT}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputRow, { marginTop: 12 }]}>
            <Text style={styles.leftIcon}>*</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={MUTED}
              autoCapitalize="none"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              selectionColor={ACCENT}
            />
            <Pressable
              onPress={() => setShowPass((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={10}
            >
              <Text style={styles.eyeText}>{showPass ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          {/* Forgot password */}
          <Pressable
            onPress={() => router.navigate("/(auth)/reset")}
            style={styles.linkRow}
            hitSlop={8}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Sign In */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.signInBtn, isSigningIn && { opacity: 0.7 }]}
            onPress={onSignIn}
            disabled={isSigningIn}
          >
            <Text style={styles.signInText}>
              {isSigningIn ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.signInBtn, styles.secondaryBtn]}
            onPress={() => router.navigate("/(auth)/register")}
          >
            <Text style={[styles.signInText, styles.secondaryBtnText]}>
              Register
            </Text>
          </TouchableOpacity>

          {/* Social (visual) */}
          <Text style={styles.socialLegend}>Or by social accounts</Text>
          <View style={styles.socialRow}>
            <View style={styles.socialCircle}>
              <Text style={styles.socialText}>f</Text>
            </View>
            <View style={styles.socialCircle}>
              <Text style={styles.socialText}>G</Text>
            </View>
            <View style={styles.socialCircle}>
              <Text style={styles.socialText}>t</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },

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

  formCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#26172E", // sutil variación dentro de la paleta
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  form: {
    width: "100%",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    backgroundColor: BG_MID,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#4A3355", // un pelín más claro que BORDER
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

  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: BORDER,
  },

  eyeText: {
    color: ACCENT,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
  },

  linkRow: {
    alignSelf: "flex-end",
    marginTop: 12,
    flexDirection: "row",
  },

  linkText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

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

  signInBtn: {
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

  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // botón secundario visual (mismo componente, solo estilos)
  secondaryBtn: {
    backgroundColor: "transparent",
    borderColor: ACCENT,
  },
  secondaryBtnText: {
    color: ACCENT,
  },

  socialLegend: {
    textAlign: "center",
    color: MUTED,
    marginTop: 18,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    backgroundColor: BG_MID,
    borderWidth: 1,
    borderColor: "rgba(139, 74, 156, 0.45)", // ACCENT con transparencia
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  socialText: {
    color: TEXT,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
