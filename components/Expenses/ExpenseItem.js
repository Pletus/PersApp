// components/Expenses/ExpenseItem.js
import { View, Text, StyleSheet } from "react-native";

export default function ExpenseItem({ description, amount, date }) {
  return (
    <View style={styles.item}>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.amount}>€ {amount.toFixed(2)}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#ffe5b4",
    borderRadius: 8,
    elevation: 2,
  },
  description: {
    fontWeight: "bold",
    fontSize: 16,
  },
  amount: {
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
});
