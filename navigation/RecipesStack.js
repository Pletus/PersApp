import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategoriesScreen from "../screens/Recipes/CategoriesScreen";
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
    </Stack.Navigator>
  );
}
