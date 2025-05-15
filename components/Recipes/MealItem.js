// components/Recipes/MealItem.js
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function MealItem({ title, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
