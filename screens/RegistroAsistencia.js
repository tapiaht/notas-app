import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const estados = [
  { key: "presente", icon: "check-circle", color: "green" },
  { key: "tarde", icon: "schedule", color: "orange" },
  { key: "ausente", icon: "cancel", color: "red" },
];

const RegistroAsistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  

  useEffect(() => {
    fetch(`http://192.168.100.217:3000/api/estudiantes?curso=PRIMEROA`)
      .then((response) => response.json())
      .then((data) =>
        setAsistencias(data.map((est) => ({ ...est, estado: "pendiente" })))
      )
      .catch((error) => console.error("Error al obtener estudiantes", error));
  }, []);
  const cambiarEstado = async (id, RUDE, curso, nuevoEstado) => {
    try {
      // Enviar el estado al backend
      const response = await fetch("http://192.168.100.217:3000/api/asistencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          RUDE,
          curso,
          fecha: new Date().toISOString().split("T")[0], // Fecha actual
          estado: nuevoEstado,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("✅ Asistencia registrada:", data);
        // Actualizar solo el estudiante seleccionado en el estado local
        setAsistencias((prev) =>
          prev.map((est) => (est.RUDE === RUDE ? { ...est, estado: nuevoEstado } : est))
        );
      } else {
        console.error("❌ Error en el registro de asistencia:", data.error);
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <MaterialIcons name="person" size={30} color="#777" style={styles.iconoPerfil} />
      <Text style={styles.nombre}>{item.nombre}</Text>
      <View style={styles.botonesEstado}>
        {estados.map((estado) => (
          <TouchableOpacity
            key={estado.key}
            onPress={() => cambiarEstado(item.id, item.RUDE, item.curso, estado.key)}
          >
            <MaterialIcons
              name={estado.icon}
              size={30}
              color={item.estado === estado.key ? estado.color : "#ccc"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro de Asistencia</Text>
      <FlatList
        data={asistencias}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#F5F5F5" },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconoPerfil: { marginRight: 10 },
  nombre: { flex: 1, fontSize: 16 },
  botonesEstado: { flexDirection: "row", gap: 10 },
});

export default RegistroAsistencia;
