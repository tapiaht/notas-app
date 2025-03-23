import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, Button } from 'react-native';
// import { useState } from 'react';
// import axios from 'axios';

// export default function App() {
//   const [notas, setNotas] = useState(null);

//   const obtenerNotas = async () => {
//     try {
//       const response = await axios.get('https://centralizado.up.railway.app/api/obtener-notas?curso=PrimeroA');
//       setNotas(response.data);
//     } catch (error) {
//       console.error('Error al obtener notas:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text>Consulta de Notas</Text>
//       <Button title="Obtener Notas" onPress={obtenerNotas} />
//       {notas && <Text>{JSON.stringify(notas, null, 2)}</Text>}
//       <StatusBar style="auto" />
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function App() {
  
  const [alumnos, setAlumnos] = useState([]);
  const obtenerNotas = async () => {
    try {
      const response = await axios.get(
        "https://centralizado.up.railway.app/api/obtener-notas?curso=PrimeroA"
      );

      // Convertir la estructura de datos
      const alumnosTransformados = response.data.data.map((item) => ({
        id: item[0], // ID del alumno
        genero: item[1], // Género (F/M)
        ci: item[2], // Número de carnet
        nombre: item[3], // Nombre completo
        nota1: item[4],
        nota2: item[5],
        nota3: item[6],
        nota4: item[7],
        foto: `https://randomuser.me/api/portraits/${
          item[1] === "F" ? "women" : "men"
        }/${item[0]}.jpg`, // Imagen aleatoria según el género
      }));

      setAlumnos(alumnosTransformados);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con gradiente */}
      <LinearGradient colors={['#8E2DE2', '#FF416C']} style={styles.header}>
        <Text style={styles.headerTitle}>Biología 1-A</Text>
        <Text style={styles.date}>24 - Febrero - 2021</Text>
      </LinearGradient>

      {/* Botón para obtener datos */}
      <Button mode="contained" onPress={obtenerNotas} style={styles.button}>
        Obtener Notas
      </Button>

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
  list: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  date: {
    fontSize: 16,
    color: 'white',
  },
  button: {
    margin: 20,
    backgroundColor: '#6200EE',
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
});
