import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Switch,
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

function CreateMealScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [complexity, setComplexity] = useState("");
  const [affordability, setAffordability] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isLactoseFree, setIsLactoseFree] = useState(false);

  async function submitHandler() {
    if (!title || !imageUrl || !duration || !complexity || !affordability) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }

    const newMeal = {
      id: uuid.v4(),
      categoryIds: ["c1"], // puedes permitir seleccionar categorías más adelante
      title,
      imageUrl,
      duration: +duration,
      complexity,
      affordability,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      steps: steps.split("\n").map((s) => s.trim()),
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
      <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="URL Imagen" value={imageUrl} onChangeText={setImageUrl} />
      <TextInput style={styles.input} placeholder="Duración (minutos)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Complejidad (simple, hard...)" value={complexity} onChangeText={setComplexity} />
      <TextInput style={styles.input} placeholder="Costo (affordable, pricey...)" value={affordability} onChangeText={setAffordability} />
      <TextInput style={styles.input} placeholder="Ingredientes (separados por coma)" value={ingredients} onChangeText={setIngredients} />
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
});
