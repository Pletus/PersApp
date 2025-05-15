import { useState, useCallback } from "react";
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
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { MEALS } from "../../data/dummy-data";

function MealDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { mealId } = route.params;

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingImage, setUpdatingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function fetchMealDetail() {
        try {
          const stored = await AsyncStorage.getItem("meals");
          const userMeals = stored ? JSON.parse(stored) : [];

          const allMeals = [...MEALS, ...userMeals];
          const selectedMeal = allMeals.find((meal) => meal.id === mealId);
          setMeal(selectedMeal);

          // Guardar la última receta vista para mostrarla en HomeScreen
          if (selectedMeal) {
            await AsyncStorage.setItem(
              "lastVisitedMeal",
              JSON.stringify(selectedMeal)
            );
          }
        } catch (error) {
          console.error("Error al cargar el detalle de la receta:", error);
        } finally {
          setLoading(false);
        }
      }

      fetchMealDetail();
    }, [mealId])
  );

  const isCustomMeal = meal && !MEALS.find((m) => m.id === meal.id);

  async function requestPermission(type) {
    const permissionResult =
      type === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso denegado",
        `Necesitamos acceso a la ${type === "camera" ? "cámara" : "galería"}.`
      );
      return false;
    }
    return true;
  }

  async function pickImage() {
    Alert.alert("Seleccionar imagen", "¿Tomar foto o elegir de la galería?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Tomar foto",
        onPress: async () => {
          if (!(await requestPermission("camera"))) return;
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
          });
          if (!result.canceled) {
            await updateMealImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Elegir de galería",
        onPress: async () => {
          if (!(await requestPermission("gallery"))) return;
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
          });
          if (!result.canceled) {
            await updateMealImage(result.assets[0].uri);
          }
        },
      },
    ]);
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
        setMeal({
          ...userMeals[mealIndex],
          imageUrl: pickedUri + "?t=" + Date.now(),
        });
      } else {
        Alert.alert(
          "Solo puedes modificar imágenes de recetas creadas por ti."
        );
      }
    } catch (error) {
      console.error("Error al actualizar la imagen:", error);
    } finally {
      setUpdatingImage(false);
    }
  }

  async function deleteMeal() {
    Alert.alert("Eliminar receta", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem("meals");
            let meals = stored ? JSON.parse(stored) : [];
            meals = meals.filter((m) => m.id !== meal.id);
            await AsyncStorage.setItem("meals", JSON.stringify(meals));
            Alert.alert("Eliminado", "La receta fue eliminada.");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", "No se pudo eliminar la receta.");
          }
        },
      },
    ]);
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (!meal)
    return (
      <View style={styles.centered}>
        <Text>Receta no encontrada.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {meal.imageUrl ? (
        <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: "#888" }}>No hay imagen</Text>
        </View>
      )}
      <View style={{ margin: 10 }}>
        <Button
          title={meal.imageUrl ? "Cambiar Foto" : "Añadir Foto"}
          onPress={pickImage}
          disabled={updatingImage}
        />
        {isCustomMeal && (
          <>
            <View style={{ marginTop: 10 }}>
              <Button
                title="Editar Receta"
                onPress={() => navigation.navigate("CreateMeal", { meal })}
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                title="Eliminar Receta"
                color="#d9534f"
                onPress={deleteMeal}
                disabled={updatingImage}
              />
            </View>
          </>
        )}
      </View>
      <Text style={styles.title}>{meal.title}</Text>
      <Text style={styles.detail}>
        {meal.duration} min | {meal.complexity} | {meal.affordability}
      </Text>
      <Text style={styles.sectionTitle}>Ingredientes</Text>
      {meal.ingredients.map((i, idx) => (
        <Text key={idx} style={styles.textItem}>
          • {i}
        </Text>
      ))}
      <Text style={styles.sectionTitle}>Pasos</Text>
      {meal.steps.map((s, idx) => (
        <Text key={idx} style={styles.textItem}>
          {idx + 1}. {s}
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
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 250 },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  title: { fontSize: 24, fontWeight: "bold", margin: 10, textAlign: "center" },
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
  textItem: { marginHorizontal: 15, marginVertical: 4, fontSize: 14 },
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
