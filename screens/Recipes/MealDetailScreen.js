import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

import { MEALS } from "../../data/dummy-data";

function MealDetailScreen() {
  const route = useRoute();
  const { mealId } = route.params;

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMealDetail() {
      try {
        const stored = await AsyncStorage.getItem("meals");
        const userMeals = stored ? JSON.parse(stored) : [];

        const allMeals = [...MEALS, ...userMeals];

        const selectedMeal = allMeals.find((meal) => meal.id === mealId);
        setMeal(selectedMeal);
      } catch (error) {
        console.error("Error al cargar el detalle de la receta:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMealDetail();
  }, [mealId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.centered}>
        <Text>Receta no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{meal.title}</Text>
      <Text style={styles.detail}>
        {meal.duration} min | {meal.complexity} | {meal.affordability}
      </Text>

      <Text style={styles.sectionTitle}>Ingredientes</Text>
      {meal.ingredients.map((ingredient, index) => (
        <Text key={index} style={styles.textItem}>
          • {ingredient}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Pasos</Text>
      {meal.steps.map((step, index) => (
        <Text key={index} style={styles.textItem}>
          {index + 1}. {step}
        </Text>
      ))}

      <View style={styles.tags}>
        {meal.isGlutenFree && <Text style={styles.tag}>Sin Gluten</Text>}
        {meal.isVegan && <Text style={styles.tag}>Vegano</Text>}
        {meal.isVegetarian && <Text style={styles.tag}>Vegetariano</Text>}
        {meal.isLactoseFree && <Text style={styles.tag}>Sin Lactosa</Text>}
      </View>
    </ScrollView>
  );
}

export default MealDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 10,
    textAlign: "center",
  },
  detail: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginHorizontal: 10,
  },
  textItem: {
    marginHorizontal: 15,
    marginVertical: 4,
    fontSize: 14,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: 10,
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "#ccc",
    borderRadius: 10,
    padding: 6,
    margin: 4,
    fontSize: 12,
  },
});
