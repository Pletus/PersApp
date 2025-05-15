import { FlatList, View, Button, StyleSheet } from "react-native";
import CategoryGridTile from "../../components/CategoryGridTile";
import { CATEGORIES } from "../../data/dummy-data";

function CategoriesScreen({ navigation }) {
  function renderCategoryItem(itemData) {
    function pressHandler() {
      navigation.navigate("MealsOverview", {
        categoryId: itemData.item.id,
      });
    }

    return (
      <CategoryGridTile
        title={itemData.item.title}
        color={itemData.item.color}
        onPress={pressHandler}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addButton}>
        <Button
          title="Añadir Receta"
          onPress={() => navigation.navigate("CreateMeal")}
        />
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 8, flexGrow: 1 }}
      />
    </View>
  );
}

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
