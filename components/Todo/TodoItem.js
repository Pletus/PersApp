// components/Todo/TodoItem.js
import { View, Text, StyleSheet } from "react-native";

export default function TodoItem({ title, done }) {
  return (
    <View style={[styles.item, done && styles.done]}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  done: {
    backgroundColor: "#d3ffd3",
  },
  text: {
    fontSize: 16,
  },
});
