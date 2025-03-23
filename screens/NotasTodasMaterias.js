import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [curso, setCurso] = useState("PRIMEROA"); // Curso por defecto

  const cursos = [
    "PRIMEROA", "PRIMEROB", "SEGUNDOA", "SEGUNDOB", "TERCEROA", "TERCEROB",
    "CUARTOA", "CUARTOB", "QUINTOA", "QUINTOB", "SEXTOA", "SEXTOB", "SEXTOC", "SEXTOE"
  ];

  useEffect(() => {
    const obtenerNotas = async () => {
      try {
        const response = await axios.get(
          `https://centralizado.up.railway.app/api/obtener-notas?curso=${curso}`
        );

        // Transformar los datos recibidos
        const alumnosTransformados = response.data.data.map((item) => ({
          id: item[0],
          genero: item[1],
          ci: item[2],
          nombre: item[3],
          nota1: item[4],
          nota2: item[5],
          nota3: item[6],
          nota4: item[7],
          foto: `https://randomuser.me/api/portraits/${item[1] === "F" ? "women" : "men"}/${item[0]}.jpg`,
        }));

        setAlumnos(alumnosTransformados);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    obtenerNotas(); // Llamar automáticamente al obtener notas cuando cambia el curso
  }, [curso]); // Se vuelve a llamar cada vez que cambia el curso

  return (
    <View style={styles.container}>
      {/* Encabezado con gradiente */}
      <LinearGradient colors={['#8E2DE2', '#FF416C']} style={styles.header}>
        <Text style={styles.headerTitle}>Notas de los Alumnos</Text>
        <Text style={styles.date}>Selecciona un curso</Text>
      </LinearGradient>

      {/* Picker para seleccionar curso */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Selecciona un curso:</Text>
        <Picker
          selectedValue={curso}
          onValueChange={(itemValue) => setCurso(itemValue)} // Cambia el curso seleccionado
          style={styles.picker}
        >
          {cursos.map((cursoItem) => (
            <Picker.Item key={cursoItem} label={cursoItem} value={cursoItem} />
          ))}
        </Picker>
      </View>

      {/* Lista de alumnos */}
      <FlatList
        data={alumnos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.foto }} style={styles.profilePic} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.nombre}</Text>
              <View style={styles.status}>
                <Text style={styles.list}>{item.nota1}</Text>
                <Text style={styles.list}>{item.nota2}</Text>
                <Text style={styles.list}>{item.nota3}</Text>
                <Text style={styles.list}>{item.nota4}</Text>
                <FontAwesome name="check-circle" size={24} color="green" />
                <MaterialIcons name="schedule" size={24} color="gray" />
                <MaterialIcons name="cancel" size={24} color="red" />
              </View>
            </View>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 16,
    color: 'white',
  },
  pickerContainer: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  list: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
});
