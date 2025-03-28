import React, {  useContext, useEffect, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { Alert } from "react-native";
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from "@react-navigation/native";
export default function NotasPorAlumno({navigation}) {
  const { tipoUsuario,rude_rda } = useContext(AuthContext);
  const [ci, setCi] = useState('');
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const route = useRoute(); // Obtiene la información de navegación
    // Obtener el rude_rda de los parámetros de navegación
  //const { rude_rda } = route.params || {};
  console.log("tipo usuario:", tipoUsuario);
  console.log("ci_rda recibido:", rude_rda);
  useEffect(() => {
    if (tipoUsuario !== "alumno") {
      Alert.alert("Acceso denegado", "Solo los alumnos pueden acceder aquí.");
      navigation.goBack();  // Vuelve atrás si no es alumno
    }else if (rude_rda) {
      obtenerNotas(rude_rda); // Llama a la API automáticamente
    }
  }, [rude_rda, tipoUsuario]);
  const obtenerNotas = async (rude) => {
    // if (!ci) {
    //   setError('Por favor, ingresa un CI válido');
    //   return;
    // }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://centralizado.up.railway.app/api/obtener-notas-alumno?ci=${rude}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setNotas(data.materiasNotas);  // Cambié para asignar las notas del alumno a "materiasNotas"
      }
    } catch (error) {
      setError('Hubo un error al obtener las notas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta tus Notas</Text>
      
      {/* <TextInput
        style={styles.input}
        placeholder="Ingresa tu CI"
        value={ci}
        onChangeText={setCi}
        keyboardType="numeric"
      /> */}

      {/* <Button title="Ver libreta" onPress={obtenerNotas} /> */}
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={notas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.materia}>{item.materia}</Text>
            <Text style={styles.nota}>Nota: {item.nota}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    elevation: 3,
  },
  materia: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nota: {
    fontSize: 16,
    color: 'gray',
  },
});

