import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  //  context o async contenido dinámico
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido 👋</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Tareas urgentes</Text>
        <Text>- Terminar el informe del lunes</Text>
        <Text>- Comprar ingredientes para la cena</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💸 Últimos gastos</Text>
        <Text>- Supermercado: 45€</Text>
        <Text>- Suscripción Spotify: 9,99€</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Última receta vista</Text>
        <Text>Pollo al curry</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
});
