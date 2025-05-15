import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [lastVisitedMeal, setLastVisitedMeal] = useState(null);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [latestExpenses, setLatestExpenses] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          // Última receta
          const mealJSON = await AsyncStorage.getItem("lastVisitedMeal");
          setLastVisitedMeal(mealJSON ? JSON.parse(mealJSON) : null);

          // Cargar tareas guardadas (clave correcta y estructura correcta)
          const todosJSON = await AsyncStorage.getItem("todoTasks");
          const todos = todosJSON ? JSON.parse(todosJSON) : [];

          // Filtrar tareas urgentes y no completadas
          const urgents = todos.filter(
            (task) => task.done === false && task.urgent === true
          );

          setUrgentTasks(urgents);

          // Gastos fijos
          setLatestExpenses([
            { label: "Supermercado", amount: "45€" },
            { label: "Spotify", amount: "9,99€" },
          ]);
        } catch (e) {
          console.log("Error loading data", e);
        }
      }
      loadData();
    }, [])
  );

  function openMealDetail() {
    if (lastVisitedMeal) {
      navigation.navigate("MealDetail", { mealId: lastVisitedMeal.id });
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>Bienvenido 👋</Text>

      {/* Card Tareas urgentes */}
      <View style={[styles.card, styles.cardUrgent]}>
        <Text style={styles.cardTitle}>📌 Tareas Urgentes</Text>
        {urgentTasks.length === 0 ? (
          <Text style={styles.cardText}>No tienes tareas urgentes</Text>
        ) : (
          urgentTasks.map((task) => (
            <Text key={task.id} style={styles.cardText}>
              • {task.text}
            </Text>
          ))
        )}
      </View>

      {/* Card Últimos gastos */}
      <View style={[styles.card, styles.cardExpenses]}>
        <Text style={styles.cardTitle}>💸 Últimos gastos</Text>
        {latestExpenses.length === 0 ? (
          <Text style={styles.cardText}>No hay gastos recientes</Text>
        ) : (
          latestExpenses.map(({ label, amount }, i) => (
            <Text key={i} style={styles.cardText}>
              • {label}: {amount}
            </Text>
          ))
        )}
      </View>

      {/* Card Última receta vista */}
      <TouchableOpacity
        style={[styles.card, styles.cardRecipe]}
        activeOpacity={0.8}
        onPress={openMealDetail}
      >
        <Text style={styles.cardTitle}>🍽️ Última receta vista</Text>
        {lastVisitedMeal ? (
          <>
            {lastVisitedMeal.imageUrl ? (
              <Image
                source={{ uri: lastVisitedMeal.imageUrl }}
                style={styles.mealImage}
              />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Text style={{ color: "#aaa" }}>No hay imagen</Text>
              </View>
            )}
            <Text style={styles.mealTitle}>{lastVisitedMeal.title}</Text>
            <Text style={styles.mealDetails}>
              {lastVisitedMeal.duration} min | {lastVisitedMeal.complexity} |{" "}
              {lastVisitedMeal.affordability}
            </Text>
          </>
        ) : (
          <Text style={styles.cardText}>
            No has visto ninguna receta todavía
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f7fa",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#344055",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardUrgent: {
    borderLeftWidth: 6,
    borderLeftColor: "#ff6b6b", // rojo fuerte para urgente
  },
  cardExpenses: {
    borderLeftWidth: 6,
    borderLeftColor: "#4ecdc4",
  },
  cardRecipe: {
    borderLeftWidth: 6,
    borderLeftColor: "#1a535c",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: "#606060",
    marginBottom: 6,
  },
  mealImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  noImagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a535c",
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 14,
    color: "#777",
  },
});
