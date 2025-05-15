import { View, StyleSheet, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import { MEALS } from "../../data/dummy-data";

function MealsOverviewScreen() {
  const route = useRoute();
  const { categoryId } = route.params;

  const displayedMeals = MEALS.filter((meal) =>
    meal.categoryIds.includes(categoryId)
  );

  return (
    <View style={styles.container}>
      {displayedMeals.map((meal) => (
        <Text key={meal.id}>{meal.title}</Text>
      ))}
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
