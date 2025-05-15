import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

import { MEALS } from "../../data/dummy-data";
import MealItem from "../../components/Recipes/MealItem";

function MealsOverviewScreen({ navigation }) {
  const route = useRoute();
  const { categoryId } = route.params;

  const [combinedMeals, setCombinedMeals] = useState([]);

  useEffect(() => {
    async function fetchMeals() {
      try {
        const stored = await AsyncStorage.getItem("meals");
        const storedMeals = stored ? JSON.parse(stored) : [];

        const allMeals = [...MEALS, ...storedMeals];

        const filtered = allMeals.filter((meal) =>
          meal.categoryIds.includes(categoryId)
        );

        setCombinedMeals(filtered);
      } catch (error) {
        console.error("Error cargando recetas:", error);
      }
    }

    const unsubscribe = navigation.addListener("focus", fetchMeals);
    return unsubscribe;
  }, [navigation, categoryId]);

  function renderMealItem(itemData) {
    function selectMealHandler() {
      navigation.navigate("MealDetail", {
        mealId: itemData.item.id,
      });
    }

    return <MealItem meal={itemData.item} onPress={selectMealHandler} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
      />
    </View>
  );
}

export default MealsOverviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
