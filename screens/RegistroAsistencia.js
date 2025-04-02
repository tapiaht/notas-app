import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,Button, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import QRScanner from "./QRScanner";

const estados = [
  { key: "presente", icon: "check-circle", color: "green" },
  { key: "tarde", icon: "schedule", color: "orange" },
  { key: "ausente", icon: "cancel", color: "red" },
];

const RegistroAsistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuEstudiante, setMenuEstudiante] = useState(null);
  const obtenerFechaLocal = (date) => {
    return date.toISOString().split("T")[0]; // Esto devuelve YYYY-MM-DD
  };
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const fechaFormateada = obtenerFechaLocal(new Date(fechaSeleccionada)); // Convierte correctamente
        const estudiantesRes = await fetch(`http://192.168.100.217:3000/api/estudiantes?curso=PRIMEROA`);
        const estudiantes = await estudiantesRes.json();

        const asistenciaRes = await fetch(`http://192.168.100.217:3000/api/asistencia?curso=PRIMEROA&fecha=${fechaFormateada}`);
        const asistencias = await asistenciaRes.json();

        console.log("📅 Fecha enviada al backend:", fechaFormateada);
        console.log("📩 Respuesta del backend:", asistencias);
        
        const listaActualizada = estudiantes.map((est) => {
          const asistenciaEstudiante = asistencias.find((a) => a.RUDE === est.RUDE);
          return { ...est, estado: asistenciaEstudiante ? asistenciaEstudiante.estado : "pendiente" };
        });

        setAsistencias(listaActualizada);
      } catch (error) {
        console.error("❌ Error al obtener datos", error);
      }
    };

    obtenerDatos();
  }, [fechaSeleccionada]);

  const seleccionarFecha = (event, date) => {
    if (date) {
      setMostrarPicker(false);
      setFechaSeleccionada(date.toISOString().split("T")[0]);
    }
  };

//   const cambiarEstado = (RUDE, nuevoEstado) => {
//     setAsistencias((prev) =>
//       prev.map((est) => (est.RUDE === RUDE ? { ...est, estado: nuevoEstado } : est))
//     );
//   };
const cambiarEstado = async (RUDE, nuevoEstado) => {
    setAsistencias((prev) =>
      prev.map((est) => (est.RUDE === RUDE ? { ...est, estado: nuevoEstado } : est))
    );
  
    try {
      const respuesta = await fetch("http://192.168.100.217:3000/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RUDE,
          curso: "PRIMEROA",
          fecha: fechaSeleccionada,
          estado: nuevoEstado,
        }),
      });
  
      const resultado = await respuesta.json();
  
      if (!respuesta.ok) {
        console.error("❌ Error al guardar asistencia:", resultado.error);
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
    }
  };
  const contarEstados = (estado) => asistencias.filter((est) => est.estado === estado).length;
  const borrarAsistencia = async () => {
    try {
      const respuesta = await fetch("http://192.168.100.217:3000/api/asistencia", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curso: "PRIMEROA",
          fecha: fechaSeleccionada,
        }),
      });
  
      const resultado = await respuesta.json();
  
      if (respuesta.ok) {
        setAsistencias((prev) => prev.map((est) => ({ ...est, estado: "pendiente" }))); // Reiniciar estados en la UI
        //Alert.alert("🗑️ Asistencia eliminada", "Puedes volver a registrar la asistencia.");
      } else {
        //Alert.alert("❌ Error", resultado.error || "No se pudo borrar la asistencia.");
      }
    } catch (error) {
      console.error("❌ Error al borrar asistencia:", error);
      //Alert.alert("❌ Error", "Hubo un problema al conectar con el servidor.");
    }
  };
  const totalAsistencia = async () => {
    try {
      const respuesta = await fetch("http://192.168.100.217:3000/api/asistenciatotal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curso: "PRIMEROA",
          fecha: fechaSeleccionada,
        }),
      });
  
      const resultado = await respuesta.json();
  
      if (respuesta.ok) {
        setAsistencias((prev) => prev.map((est) => ({ ...est, estado: "presente" }))); // Actualizar UI
        //Alert.alert("☑️ Asistencia completa", "Se registró la asistencia de todo el curso.");
      } else {
        //Alert.alert("❌ Error", resultado.error || "No se pudo registrar la asistencia.");
      }
    } catch (error) {
      console.error("❌ Error al registrar asistencia:", error);
      //Alert.alert("❌ Error", "Hubo un problema al conectar con el servidor.");
    }
  };
  //Funcion rellenar los registros no marcados con faltas.
  const marcarFaltas = async () => {
    try {
      const respuesta = await fetch("http://192.168.100.217:3000/api/rellenarausencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curso: "PRIMEROA",
          fecha: fechaSeleccionada,
        }),
      });
  
      const resultado = await respuesta.json();
  
      if (respuesta.ok) {
        //setAsistencias((prev) => prev.map((est) => ({ ...est, estado: "ausente"  }))); // Actualizar UI
        //setAsistencias(prev => prev.map(est => (est.estado ? est : { ...est, estado: "ausente" }))); // Actualiza la UI
        //setAsistencias(prev => prev.map(est => !est.estado ? { ...est, estado: "ausente" } : est));
        //setAsistencias((prev) => prev.map((est) => !est.estado ? { ...est, estado: "ausente" } : est));
        setAsistencias((prev) => prev.map((est) => !est.estado || est.estado === "pendiente" ? { ...est, estado: "ausente" } : est));
        console.log("☑️ Asistencia completada", resultado.message);
      } else {
        console.error("❌ Error", resultado.error || "No se pudo completar la asistencia.");
      }
    } catch (error) {
      console.error("❌ Error al marcar faltas Hubo un problema al conectar con el servidor:", error);
    }
  };
  const handleQRScanned = async (qrData) => {
    console.log("📸 QR Escaneado:", qrData);

    try {
      const response = await fetch("http://192.168.100.217:3000/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RUDE: qrData, // El código QR representa el RUDE del estudiante
          curso: "PRIMEROA",
          fecha: new Date().toISOString().split("T")[0], // Fecha actual
          estado: "presente",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setAsistencia((prev) => [...prev, qrData]); // Agregar a la lista de asistencia
        Alert.alert("✅ Asistencia registrada", `Alumno: ${qrData}`);
      } else {
        Alert.alert("⚠️ Error", result.error || "No se pudo registrar la asistencia");
      }
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con fecha y resumen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMostrarPicker(true)}>
          <Text style={styles.fecha}>📅 {fechaSeleccionada}</Text>
        </TouchableOpacity>

        <View style={styles.resumen}>
          <Text>👥 {asistencias.length}</Text>
          <Text>✅ {contarEstados("presente")}</Text>
          <Text>🕒 {contarEstados("tarde")}</Text>
          <Text>❌ {contarEstados("ausente")}</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="menu" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Lista de estudiantes */}
      <FlatList
        key={fechaSeleccionada}
        data={asistencias}
        keyExtractor={(item) => item.RUDE}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <View style={styles.botonesEstado}>
              {estados.map((estado) => (
                <TouchableOpacity key={estado.key} onPress={() => cambiarEstado(item.RUDE, estado.key)}>
                  <MaterialIcons
                    name={estado.icon}
                    size={30}
                    color={item.estado === estado.key ? estado.color : "#ccc"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setMenuEstudiante(item.RUDE)}>
              <MaterialIcons name="more-vert" size={30} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Picker de fecha */}
      {mostrarPicker && (
        <DateTimePicker
          value={new Date(fechaSeleccionada)}
          mode="date"
          display="default"
          onChange={seleccionarFecha}
        />
      )}

      {/* Modal de menú general */}
      <Modal visible={menuVisible} transparent>
        <View style={styles.modal}>
        
          <TouchableOpacity onPress={() => setMenuVisible(false)}>
            <QRScanner onQRScanned={handleQRScanned} />
            <Text>🚫Cerrar Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={totalAsistencia}>
            <Text>✅ Marcar Todos Presentes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleQRScanned}>
            <Text>📸 Usar QR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={marcarFaltas}>
            <Text>❌ Rellenar Todos Ausentes</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>📚 Actividad Grupal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonEliminar} onPress={borrarAsistencia}>
            <Text style={styles.textoBoton}>🗑️ Borrar Asistencia</Text>
          </TouchableOpacity>;
        </View>
      </Modal>

      {/* Modal de opciones por estudiante */}
      {menuEstudiante && (
        <Modal visible={true} transparent>
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => setMenuEstudiante(null)}>
              <Text>Justificar Retardo</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Justificar Falta</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Agregar Nota</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fecha: { fontSize: 18, fontWeight: "bold" },
  resumen: { flexDirection: "row", gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  nombre: { flex: 1, fontSize: 16 },
  botonesEstado: { flexDirection: "row", gap: 10 },
  modal: {
    position: "absolute",
    top: "30%",
    left: "20%",
    right: "20%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
});

export default RegistroAsistencia;
