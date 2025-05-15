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
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { CATEGORIES } from "../../data/dummy-data";
import { useRoute } from "@react-navigation/native";

function CreateMealScreen({ navigation }) {
  const route = useRoute();
  const editingMeal = route.params?.meal;

  const [title, setTitle] = useState(editingMeal?.title || "");
  const [imageUri, setImageUri] = useState(editingMeal?.imageUrl || "");
  const [duration, setDuration] = useState(editingMeal?.duration?.toString() || "");
  const [complexity, setComplexity] = useState(editingMeal?.complexity || "");
  const [affordability, setAffordability] = useState(editingMeal?.affordability || "");
  const [ingredients, setIngredients] = useState(editingMeal?.ingredients?.join(", ") || "");
  const [steps, setSteps] = useState(editingMeal?.steps?.join("\n") || "");
  const [categoryId, setCategoryId] = useState(editingMeal?.categoryIds?.[0] || CATEGORIES[0]?.id);
  const [isGlutenFree, setIsGlutenFree] = useState(editingMeal?.isGlutenFree || false);
  const [isVegan, setIsVegan] = useState(editingMeal?.isVegan || false);
  const [isVegetarian, setIsVegetarian] = useState(editingMeal?.isVegetarian || false);
  const [isLactoseFree, setIsLactoseFree] = useState(editingMeal?.isLactoseFree || false);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  async function takeImageHandler() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function submitHandler() {
    if (!title.trim() || !duration || !complexity || !affordability) {
      Alert.alert("Error", "Completa los campos obligatorios.");
      return;
    }

    const newMeal = {
      id: editingMeal?.id || uuid.v4(),
      categoryIds: [categoryId],
      title,
      imageUrl: imageUri,
      duration: +duration,
      complexity,
      affordability,
      ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
      steps: steps.split("\n").map(s => s.trim()).filter(Boolean),
      isGlutenFree,
      isVegan,
      isVegetarian,
      isLactoseFree,
    };

    try {
      const storedMeals = await AsyncStorage.getItem("meals");
      let meals = storedMeals ? JSON.parse(storedMeals) : [];

      if (editingMeal) {
        const index = meals.findIndex((m) => m.id === editingMeal.id);
        if (index >= 0) meals[index] = newMeal;
      } else {
        meals.push(newMeal);
      }

      await AsyncStorage.setItem("meals", JSON.stringify(meals));
      Alert.alert("Éxito", editingMeal ? "Receta actualizada" : "Receta creada");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la receta.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
      <Text>Categoría:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
          {CATEGORIES.map((cat) => (
            <Picker.Item label={cat.title} value={cat.id} key={cat.id} />
          ))}
        </Picker>
      </View>
      <Button title="Tomar Foto (opcional)" onPress={takeImageHandler} />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
      <TextInput style={styles.input} placeholder="Duración" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Complejidad" value={complexity} onChangeText={setComplexity} />
      <TextInput style={styles.input} placeholder="Costo" value={affordability} onChangeText={setAffordability} />
      <TextInput style={styles.input} placeholder="Ingredientes" value={ingredients} onChangeText={setIngredients} />
      <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Pasos" value={steps} onChangeText={setSteps} />
      <View style={styles.switchContainer}><Text>Sin gluten</Text><Switch value={isGlutenFree} onValueChange={setIsGlutenFree} /></View>
      <View style={styles.switchContainer}><Text>Vegana</Text><Switch value={isVegan} onValueChange={setIsVegan} /></View>
      <View style={styles.switchContainer}><Text>Vegetariana</Text><Switch value={isVegetarian} onValueChange={setIsVegetarian} /></View>
      <View style={styles.switchContainer}><Text>Sin lactosa</Text><Switch value={isLactoseFree} onValueChange={setIsLactoseFree} /></View>
      <Button title={editingMeal ? "Guardar Cambios" : "Crear Receta"} onPress={submitHandler} />
    </ScrollView>
  );
}

export default CreateMealScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginBottom: 12, padding: 8 },
  switchContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4 },
  image: { width: "100%", height: 200, marginTop: 10, borderRadius: 8 },
});
