import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const STORAGE_KEY = "workHoursHistory";

export default function WorkScreen() {
  const [hours, setHours] = useState(0);
  const [jornada, setJornada] = useState("");
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para entrada y salida (solo hora y minuto)
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Formatea fecha a yyyy-mm-dd
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const selectedDateString = formatDate(selectedDate);

  // Formatea hora a HH:MM para mostrar en inputs
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const entry = history.find((e) => e.date === selectedDateString);
    if (entry) {
      setHours(entry.hours);
      setJornada(entry.jornada.toString());
      if (entry.startTime && entry.endTime) {
        setStartTime(new Date(entry.startTime));
        setEndTime(new Date(entry.endTime));
      } else {
        // Resetea a un valor por defecto
        const defaultStart = new Date();
        defaultStart.setHours(9, 0, 0, 0);
        const defaultEnd = new Date();
        defaultEnd.setHours(17, 0, 0, 0);
        setStartTime(defaultStart);
        setEndTime(defaultEnd);
      }
    } else {
      setHours(0);
      setJornada("");
      // Por defecto 9:00 a 17:00
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(selectedDate);
      defaultEnd.setHours(17, 0, 0, 0);
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
    }
  }, [selectedDate, history]);

  const loadHistory = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      let data = storedData ? JSON.parse(storedData) : [];
      setHistory(data);
    } catch (e) {
      console.log("Error cargando historial", e);
    }
  };

  const saveEntry = async (newEntry) => {
    try {
      let newHistory = history.filter((entry) => entry.date !== newEntry.date);
      newHistory.unshift(newEntry); // añadir al inicio
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
      setHours(newEntry.hours);
      setJornada(newEntry.jornada.toString());
    } catch (e) {
      console.log("Error guardando entrada", e);
    }
  };

  // Calcula diferencia en horas entre start y end
  const calculateWorkedHours = (start, end) => {
    const diffMs = end - start;
    if (diffMs <= 0) return 0; // No negativo
    return diffMs / (1000 * 60 * 60); // ms a horas
  };

  const onAddHours = () => {
    const parsedJornada = parseFloat(jornada);
    if (isNaN(parsedJornada) || parsedJornada <= 0) {
      Alert.alert("Error", "Por favor ingresa un número válido de jornada");
      return;
    }
    const workedHours = calculateWorkedHours(startTime, endTime);
    if (workedHours <= 0) {
      Alert.alert(
        "Error",
        "La hora de salida debe ser posterior a la hora de entrada"
      );
      return;
    }

    // Guardamos o actualizamos la entrada para el día seleccionado:
    saveEntry({
      date: selectedDateString,
      hours: workedHours,
      jornada: parsedJornada,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  const extraHours = () => {
    const j = parseFloat(jornada);
    if (isNaN(j)) return 0;
    return Math.max(0, hours - j);
  };

  const lastFiveDays = history.slice(0, 5);

  const editEntry = (date) => {
    const entry = history.find((e) => e.date === date);
    if (entry) {
      setSelectedDate(new Date(date));
      setHours(entry.hours);
      setJornada(entry.jornada.toString());
      if (entry.startTime && entry.endTime) {
        setStartTime(new Date(entry.startTime));
        setEndTime(new Date(entry.endTime));
      }
    }
  };

  const deleteEntry = async (date) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Quieres eliminar el registro del día ${date}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const newHistory = history.filter((e) => e.date !== date);
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(newHistory)
              );
              setHistory(newHistory);
              if (date === selectedDateString) {
                setHours(0);
                setJornada("");
                // Reset default times
                const defaultStart = new Date(selectedDate);
                defaultStart.setHours(9, 0, 0, 0);
                const defaultEnd = new Date(selectedDate);
                defaultEnd.setHours(17, 0, 0, 0);
                setStartTime(defaultStart);
                setEndTime(defaultEnd);
              }
            } catch (e) {
              console.log("Error eliminando entrada", e);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const extra = Math.max(0, item.hours - item.jornada);
    return (
      <View style={styles.historyItem}>
        <Text style={{ fontWeight: "bold" }}>{item.date}</Text>
        <Text>
          Trabajadas: {item.hours.toFixed(2)}h - Jornada:{" "}
          {item.jornada.toFixed(2)}h - Extra: {extra.toFixed(2)}h
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 6,
          }}
        >
          <Button title="Editar" onPress={() => editEntry(item.date)} />
          <View style={{ width: 10 }} />
          <Button
            title="Eliminar"
            color="red"
            onPress={() => deleteEntry(item.date)}
          />
        </View>
      </View>
    );
  };

  // Para mostrar el selector de fecha
  const onChangeDate = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios"); // en ios picker queda visible hasta que se cierra
    if (selected) {
      setSelectedDate(selected);
    }
  };

  // Para seleccionar hora de entrada
  const onChangeStartTime = (event, selected) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (selected) {
      // Ajustar la fecha con la fecha seleccionada para evitar errores
      const newStart = new Date(selectedDate);
      newStart.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setStartTime(newStart);
    }
  };

  // Para seleccionar hora de salida
  const onChangeEndTime = (event, selected) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (selected) {
      const newEnd = new Date(selectedDate);
      newEnd.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setEndTime(newEnd);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horas trabajadas el día seleccionado</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ fontSize: 18 }}>{selectedDateString}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginVertical: 10,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text>Hora de entrada</Text>
          <TouchableOpacity
            onPress={() => setShowStartTimePicker(true)}
            style={styles.timePicker}
          >
            <Text style={{ fontSize: 18 }}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeStartTime}
            />
          )}
        </View>

        <View style={{ alignItems: "center" }}>
          <Text>Hora de salida</Text>
          <TouchableOpacity
            onPress={() => setShowEndTimePicker(true)}
            style={styles.timePicker}
          >
            <Text style={{ fontSize: 18 }}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeEndTime}
            />
          )}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Jornada (ej: 5.5)"
        keyboardType="numeric"
        value={jornada}
        onChangeText={setJornada}
      />

      <Button title="Guardar horas trabajadas" onPress={onAddHours} />

      <Text style={styles.hours}>{hours.toFixed(2)} h</Text>
      <Text style={styles.extra}>
        Horas extras: {extraHours().toFixed(2)} h
      </Text>

      <Text style={styles.subtitle}>Últimos días trabajados</Text>
      <FlatList
        data={lastFiveDays}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        style={{ maxHeight: 250 }}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.buttonViewAll}
      >
        <Text style={{ color: "white" }}>Ver todo el historial</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Historial completo</Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.date}
            renderItem={renderItem}
          />
          <Button title="Cerrar" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a535c",
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  timePicker: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  hours: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2ecc71",
    textAlign: "center",
    marginTop: 10,
  },
  extra: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e74c3c",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    fontSize: 18,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495e",
    textAlign: "center",
  },
  historyItem: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
  },
  buttonViewAll: {
    backgroundColor: "#3498db",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
});
