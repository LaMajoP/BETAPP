import { StatusBar, StyleSheet, Text, View } from "react-native";
const BG = "#1A0F1F", TEXT = "#F0E8F5", MUTED = "#9B7DA8";
export default function Explore() {
  return (
    <View style={styles.c}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.h1}>Explore</Text>
      <Text style={styles.p}>Search matches, leagues and trending bets.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:BG,alignItems:"center",justifyContent:"center",padding:16},
  h1:{color:TEXT,fontSize:22,fontWeight:"800",marginBottom:8},
  p:{color:MUTED}
});
