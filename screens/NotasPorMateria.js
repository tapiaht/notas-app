import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function NotasPorMateria() {
  const [notas, setNotas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState("PRIMEROA"); // Curso por defecto
  const [trimestre, setTrimestre] = useState("1");
  const [materia, setMateria] = useState("MAT");

  const cursos = [
    "PRIMEROA", "PRIMEROB", "SEGUNDOA", "SEGUNDOB", "TERCEROA", "TERCEROB",
    "CUARTOA", "CUARTOB", "QUINTOA", "QUINTOB", "SEXTOA", "SEXTOB", "SEXTOC", "SEXTOE"
  ];

  const materias = [
    { label: "Matemáticas", value: "MAT" },
    { label: "Lengua", value: "LCO" },
    { label: "Ciencias", value: "CSN" },
    { label: "Religión", value: "VER" },
    { label: "Inglés", value: "LEX" },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://centralizado.up.railway.app/api/obtener-notas-trimestre-materia?curso=${curso}&trimestre=${trimestre}&materia=${materia}`
    )
      .then((response) => response.json())
      .then((data) => {
        setNotas(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error obteniendo notas:", error));
  }, [curso, trimestre, materia]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecciona curso, trimestre y materia</Text>

      {/* Picker para seleccionar el curso */}
      <Picker
        selectedValue={curso}
        onValueChange={(itemValue) => setCurso(itemValue)}
        style={styles.picker}
      >
        {cursos.map((cursoItem) => (
          <Picker.Item key={cursoItem} label={cursoItem} value={cursoItem} />
        ))}
      </Picker>

      {/* Picker para seleccionar el trimestre */}
      <Picker
        selectedValue={trimestre}
        onValueChange={(itemValue) => setTrimestre(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Trimestre 1" value="1" />
        <Picker.Item label="Trimestre 2" value="2" />
        <Picker.Item label="Trimestre 3" value="3" />
      </Picker>

      {/* Picker para seleccionar la materia */}
      <Picker
        selectedValue={materia}
        onValueChange={(itemValue) => setMateria(itemValue)}
        style={styles.picker}
      >
        {materias.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      {/* Mostrar notas */}
      <Text style={styles.subtitulo}>
        Notas de {notas?.materia} - Trimestre {notas?.trimestre} - {curso}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={notas?.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.nota}>Nota: {item.nota}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  picker: { height: 50, backgroundColor: "#f0f0f0", marginBottom: 10 },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  nombre: { fontSize: 16, fontWeight: "bold" },
  nota: { fontSize: 14, color: "gray" },
});
