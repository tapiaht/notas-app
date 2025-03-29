import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function Home({ navigation }) {
  const { usuario, tipoUsuario } = useContext(AuthContext); // Datos del usuario desde el contexto
  const [loading, setLoading] = useState(true);
  const { setIsAuthenticated } = useContext(AuthContext);
  //const navigation = useNavigation();
  

  useEffect(() => {
    if (tipoUsuario === "alumno") {
      navigation.replace("Notas por Alumno");
    }
  }, []);
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) {
          navigation.replace('Login'); // Redirigir si no hay sesión guardada
        }
      } catch (error) {
        console.error("Error al verificar la sesión", error);
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Elimina el usuario guardado
      setIsAuthenticated(false); // Asegura que el estado de autenticación cambia
      await AsyncStorage.clear();
      navigation.navigate('Login'); // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {usuario ? (
        <>
          <Text style={styles.title}>Bienvenido, {usuario.nombre}</Text>
          <Text>Tipo de usuario: {tipoUsuario}</Text>

          {tipoUsuario === 'alumno' ? (
            <Text>Curso: {usuario.cursos}</Text> 
          ) : (
            <Text>Cursos asignados: {usuario.cursos}</Text> 
          )}

          <Button 
            title="Consultar Notas" 
            // onPress={() => navigation.navigate('NotasPorAlumno', { rude_rda: usuario.rude_rda })}
            onPress={() => navigation.navigate('Por Alumno', { rude_rda: usuario.rude_rda })} 
          />
          <Button 
            title="Cerrar Sesión" 
            onPress={cerrarSesion} 
            color="red"
          />
        </>
      ) : (
        <Text>Error al cargar los datos.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
