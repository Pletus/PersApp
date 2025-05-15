import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MealDetailScreen from "../screens/Recipes/MealDetailScreen";
import CategoriesScreen from "../screens/Recipes/CategoriesScreen";
import CreateMealScreen from "../screens/Recipes/CreateMealScreen";
import MealsOverviewScreen from "../screens/Recipes/MealsOverviewScreen";

const Stack = createNativeStackNavigator();

export default function RecipesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MealsCategories"
        component={CategoriesScreen}
        options={{ title: "Categorías" }}
      />
      <Stack.Screen
        name="MealsOverview"
        component={MealsOverviewScreen}
        options={{ title: "Comidas" }}
      />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
      <Stack.Screen name="CreateMeal" component={CreateMealScreen} />
      <Stack.Screen name="NewMeal" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}
