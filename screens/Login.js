import React, {useContext, useState, useEffect  } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

export default function Login({ navigation }) {
  const [tipo, setTipo] = useState("docente"); // "alumno" o "docente"
  const [ci_rda, setIdentificador] = useState("79350296");
  const { login } = useContext(AuthContext);
   // Efecto para actualizar ci_rda cuando cambia tipo
   useEffect(() => {
    if (tipo === "docente") {
      setIdentificador("79723174"); // Valor por defecto para docente
    } else if (tipo === "alumno") {
      setIdentificador("809000142017269"); // Valor por defecto para alumno
    }
  }, [tipo]); // Se ejecuta cada vez que tipo cambia
  const handleLogin = async () => {
    if (!ci_rda) {
      Alert.alert("Error", "Por favor ingresa tu RUDE o RDA");
      return;
    }

    try {

      const response = await fetch("https://centralizado.up.railway.app/api/login", {
      //const response = await fetch("http://192.168.100.217:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo, ci_rda }),
      });
      console.log("Respuesta recibida:", response)
      const data = await response.json();
      console.log("Datos de la respuesta:", data);
      if (response.ok) {
        Alert.alert("Bienvenido", `Hola, ${data.usuario.nombre}`);
        //login(); // Llama a la función login para actualizar isAuthenticated
        login({ ...data.usuario, tipo });  // Guardamos el tipo (alumno/docente)
        //navigation.navigate("Home", { usuario: data.usuario });
        await AsyncStorage.setItem('user', JSON.stringify(data.usuario)); // Guarda sesión
        //navigation.replace("Home", { usuario: data.usuario });
        navigation.navigate("Home", { usuario: data.usuario }); // Navega a Home
      } else {
        console.error("Error");
        //Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Error en la solicitud: no se pudo contectar con el servidor ", error);
      //Alert.alert("Error", "No se pudo conectar con el servidor" );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClassScore</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Iniciar sesión</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, tipo === "alumno" && styles.selected]}
          onPress={() => setTipo("alumno")}
        >
          <Text style={styles.toggleText}>Alumno</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, tipo === "docente" && styles.selected]}
          onPress={() => setTipo("docente")}
        >
          <Text style={styles.toggleText}>Docente</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={tipo === "alumno" ? "Ingresa tu RUDE" : "Ingresa tu RDA"}
        value={ci_rda}
        onChangeText={setIdentificador}
      />

      <Button title="Ingresar" onPress={handleLogin} />

      <TouchableOpacity onPress={() => Alert.alert("Recuperación", "Función en desarrollo")}>
        <Text style={styles.link}>Olvidé mi contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
  },
  selected: {
    backgroundColor: "#007bff",
  },
  toggleText: {
    color: "#fff",
  },
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  link: {
    color: "#00f",
    marginTop: 10,
  },
});
