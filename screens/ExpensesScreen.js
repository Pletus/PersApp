import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "transactions";

export default function ExpensesScreen() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const saveMonthlyBalance = async () => {
      const balance = getMonthlyBalance();
      await AsyncStorage.setItem("monthlyBalance", JSON.stringify(balance));
    };
    saveMonthlyBalance();
  }, [transactions]);

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data !== null) {
        setTransactions(JSON.parse(data));
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las transacciones");
    }
  };

  const saveTransactions = async (newTransactions) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar las transacciones");
    }
  };

  const addTransaction = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert("Error", "Ingresa una cantidad válida");
      return;
    }
    const newTransaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    };
    const newTransactions = [newTransaction, ...transactions];
    saveTransactions(newTransactions);
    // Limpiar campos
    setAmount("");
    setDescription("");
    setCategory("");
  };

  const deleteTransaction = (id) => {
    Alert.alert("Eliminar", "¿Deseas eliminar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const newTransactions = transactions.filter((t) => t.id !== id);
          saveTransactions(newTransactions);
        },
      },
    ]);
  };

  const getMonthlyBalance = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const [year, month] = t.date.split("-").map(Number);
      if (year === currentYear && month - 1 === currentMonth) {
        if (t.type === "income") {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });

    return income - expense;
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>
        {item.date} - {item.description} ({item.category}): {item.amount}€
      </Text>
      <Button title="Eliminar" onPress={() => deleteTransaction(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Transacción</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />
      <View style={styles.buttonRow}>
        <Button
          title="Gasto"
          onPress={() => setType("expense")}
          color={type === "expense" ? "red" : "gray"}
        />
        <Button
          title="Ingreso"
          onPress={() => setType("income")}
          color={type === "income" ? "green" : "gray"}
        />
      </View>
      <Button title="Agregar" onPress={addTransaction} />
      <Text style={styles.title}>Transacciones</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  transactionItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginVertical: 5,
    borderRadius: 6,
  },
  transactionText: { fontSize: 16 },
});
