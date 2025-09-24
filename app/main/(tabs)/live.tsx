import { StyleSheet, Text, View } from "react-native";
const BG="#1A0F1F", TEXT="#F0E8F5", MUTED="#9B7DA8";
export default function Live() {
  return (
    <View style={s.c}>
      <Text style={s.h1}>Live Matches</Text>
      <Text style={s.p}>Live odds board.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:BG,alignItems:"center",justifyContent:"center"},
  h1:{color:TEXT,fontSize:22,fontWeight:"800",marginBottom:8},
  p:{color:MUTED}
});
