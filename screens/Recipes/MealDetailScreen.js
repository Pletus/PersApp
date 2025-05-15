import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { MEALS } from "../../data/dummy-data";

function MealDetailScreen() {
  const route = useRoute();
  const { mealId } = route.params;

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingImage, setUpdatingImage] = useState(false);

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

  async function requestPermission(type) {
    let permissionResult;
    if (type === "camera") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else if (type === "gallery") {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso denegado",
        `Necesitamos acceso a la ${
          type === "camera" ? "cámara" : "galería"
        } para continuar.`
      );
      return false;
    }
    return true;
  }

  async function pickImage() {
    Alert.alert(
      "Seleccionar imagen",
      "¿Quieres tomar una foto o elegir de la galería?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Tomar foto",
          onPress: async () => {
            const hasPermission = await requestPermission("camera");
            if (!hasPermission) return;

            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.7,
            });

            if (result.canceled) return;

            const pickedUri =
              result.assets && result.assets.length > 0
                ? result.assets[0].uri
                : null;

            if (!pickedUri) {
              Alert.alert("Error", "No se pudo obtener la imagen.");
              return;
            }

            await updateMealImage(pickedUri);
          },
        },
        {
          text: "Elegir de galería",
          onPress: async () => {
            const hasPermission = await requestPermission("gallery");
            if (!hasPermission) return;

            let result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.7,
            });

            if (result.canceled) return;

            const pickedUri =
              result.assets && result.assets.length > 0
                ? result.assets[0].uri
                : null;

            if (!pickedUri) {
              Alert.alert("Error", "No se pudo obtener la imagen.");
              return;
            }

            await updateMealImage(pickedUri);
          },
        },
      ]
    );
  }

  async function updateMealImage(pickedUri) {
    setUpdatingImage(true);

    try {
      const stored = await AsyncStorage.getItem("meals");
      const userMeals = stored ? JSON.parse(stored) : [];

      const mealIndex = userMeals.findIndex((m) => m.id === mealId);
      if (mealIndex >= 0) {
        userMeals[mealIndex].imageUrl = pickedUri;

        await AsyncStorage.setItem("meals", JSON.stringify(userMeals));

        const newImageUri = pickedUri + "?t=" + new Date().getTime();

        const updatedMeal = {
          ...userMeals[mealIndex],
          imageUrl: newImageUri,
        };

        setMeal(updatedMeal);

      } else {
        Alert.alert(
          "Error",
          "No se puede cambiar la foto de una receta de ejemplo, solo de las creadas."
        );
      }
    } catch (error) {
      console.error("Error al actualizar la imagen:", error);
      Alert.alert("Error", "No se pudo actualizar la imagen.");
    } finally {
      setUpdatingImage(false);
    }
  }

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
      {meal.imageUrl ? (
        <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: "#888" }}>No hay imagen disponible</Text>
        </View>
      )}

      <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
        <Button
          title={meal.imageUrl ? "Cambiar Foto" : "Añadir Foto"}
          onPress={pickImage}
          disabled={updatingImage}
        />
      </View>

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
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
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
