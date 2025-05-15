import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "todoTasks";

function TodosScreen() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        }
      } catch (e) {
        Alert.alert("Error", "No se pudieron cargar las tareas");
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  async function saveTasks(updatedTasks) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (e) {
      Alert.alert("Error", "No se pudieron guardar las tareas");
    }
  }

  function addTask() {
    if (newTaskText.trim() === "") {
      Alert.alert("Error", "Escribe el título de la tarea");
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      urgent,
      important,
      done: false,
    };
    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);
    setNewTaskText("");
    setUrgent(false);
    setImportant(false);
  }

  function toggleDone(id) {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    saveTasks(updatedTasks);
  }

  function deleteTask(id) {
    Alert.alert("Eliminar tarea", "¿Seguro que quieres eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const updatedTasks = tasks.filter((t) => t.id !== id);
          saveTasks(updatedTasks);
        },
      },
    ]);
  }

  function renderTask({ item }) {
    return (
      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => toggleDone(item.id)}>
          <Text style={[styles.taskText, item.done && styles.doneTask]}>
            {item.text}
          </Text>
        </TouchableOpacity>
        <View style={styles.tags}>
          {item.urgent && (
            <Text style={[styles.tag, { backgroundColor: "#ff6347" }]}>
              Urgente
            </Text>
          )}
          {item.important && (
            <Text style={[styles.tag, { backgroundColor: "#ffbf00" }]}>
              Importante
            </Text>
          )}
        </View>
        <Button
          title="Eliminar"
          color="#d9534f"
          onPress={() => deleteTask(item.id)}
        />
      </View>
    );
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <Text>Cargando tareas...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tareas</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea"
          value={newTaskText}
          onChangeText={setNewTaskText}
        />
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchContainer}>
          <Text>Urgente</Text>
          <Switch value={urgent} onValueChange={setUrgent} />
        </View>
        <View style={styles.switchContainer}>
          <Text>Importante</Text>
          <Switch value={important} onValueChange={setImportant} />
        </View>
      </View>
      <Button title="Añadir tarea" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

export default TodosScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  inputRow: { flexDirection: "row", marginBottom: 10 },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskContainer: {
    backgroundColor: "#eee",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  taskText: { fontSize: 16 },
  doneTask: { textDecorationLine: "line-through", color: "#888" },
  tags: { flexDirection: "row", marginTop: 6 },
  tag: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 12,
    overflow: "hidden",
  },
});
