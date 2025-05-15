import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Switch,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // npm install @react-native-picker/picker
import { CATEGORIES } from "../../data/dummy-data"; // Ajusta la ruta según tu proyecto

function CreateMealScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [duration, setDuration] = useState("");
  const [complexity, setComplexity] = useState("");
  const [affordability, setAffordability] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id || "");
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isLactoseFree, setIsLactoseFree] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permiso para usar la cámara para tomar fotos."
        );
      }
    })();
  }, []);

  async function takeImageHandler() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo abrir la cámara.");
    }
  }

  async function submitHandler() {
    if (!title.trim() || !duration.trim() || !complexity.trim() || !affordability.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }

    const newMeal = {
      id: uuid.v4(),
      categoryIds: [categoryId],
      title,
      imageUrl: imageUri,
      duration: +duration,
      complexity,
      affordability,
      ingredients: ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      steps: steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      isGlutenFree,
      isVegan,
      isVegetarian,
      isLactoseFree,
    };

    try {
      const storedMeals = await AsyncStorage.getItem("meals");
      const meals = storedMeals ? JSON.parse(storedMeals) : [];
      meals.push(newMeal);
      await AsyncStorage.setItem("meals", JSON.stringify(meals));
      Alert.alert("Éxito", "Receta creada con éxito.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la receta.");
      console.error(err);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={{ marginTop: 10 }}>Categoría:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(itemValue) => setCategoryId(itemValue)}
        >
          {CATEGORIES.map((cat) => (
            <Picker.Item label={cat.title} value={cat.id} key={cat.id} />
          ))}
        </Picker>
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Tomar Foto (opcional)" onPress={takeImageHandler} />
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={{ marginTop: 8, fontStyle: "italic", color: "#666" }}>
            No hay foto seleccionada
          </Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Duración (minutos)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Complejidad (simple, hard...)"
        value={complexity}
        onChangeText={setComplexity}
      />
      <TextInput
        style={styles.input}
        placeholder="Costo (affordable, pricey...)"
        value={affordability}
        onChangeText={setAffordability}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingredientes (ej: tomate 4, pepino 150, queso 40)"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Pasos (uno por línea)"
        value={steps}
        onChangeText={setSteps}
      />
      <View style={styles.switchContainer}>
        <Text>Sin gluten</Text>
        <Switch value={isGlutenFree} onValueChange={setIsGlutenFree} />
      </View>
      <View style={styles.switchContainer}>
        <Text>Vegana</Text>
        <Switch value={isVegan} onValueChange={setIsVegan} />
      </View>
      <View style={styles.switchContainer}>
        <Text>Vegetariana</Text>
        <Switch value={isVegetarian} onValueChange={setIsVegetarian} />
      </View>
      <View style={styles.switchContainer}>
        <Text>Sin lactosa</Text>
        <Switch value={isLactoseFree} onValueChange={setIsLactoseFree} />
      </View>

      <Button title="Crear Receta" onPress={submitHandler} />
    </ScrollView>
  );
}

export default CreateMealScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 12,
    padding: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
});
