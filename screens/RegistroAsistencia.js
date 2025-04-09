import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,Button, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
//import Camara from "./Camara";
import MultipleQRScanner from "./MultipleQRScanner"; // Importa el nuevo módulo
//import QRScanner from "./QRScanner";
//import Camara from "./Camara";

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
  const [isScannerVisible, setIsScannerVisible] = useState(false); // Estado para mostrar/ocultar el escáner
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
      }else {
        console.log(`✅ Asistencia guardada para ${RUDE} como ${nuevoEstado}`);
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
  // const handleQRScanned = async (qrData) => {
  //   console.log("📸 QR Escaneado:", qrData);

  //   try {
  //     const response = await fetch("http://192.168.100.217:3000/api/asistencia", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         RUDE: qrData, // El código QR representa el RUDE del estudiante
  //         curso: "PRIMEROA",
  //         fecha: new Date().toISOString().split("T")[0], // Fecha actual
  //         estado: "presente",
  //       }),
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       setAsistencia((prev) => [...prev, qrData]); // Agregar a la lista de asistencia
  //       Alert.alert("✅ Asistencia registrada", `Alumno: ${qrData}`);
  //     } else {
  //       Alert.alert("⚠️ Error", result.error || "No se pudo registrar la asistencia");
  //     }
  //   } catch (error) {
  //     Alert.alert("❌ Error", "No se pudo conectar con el servidor");
  //   }
  // };
 // --- Función para manejar los QR escaneados ---
 const handleQRsScanned = (scannedRudes) => {
  console.log("✅ RUDEs recibidos del escáner:", scannedRudes);
  setIsScannerVisible(false); // Oculta el escáner

  let estudiantesEncontrados = 0;
  let estudiantesNoEncontrados = [];

  scannedRudes.forEach(rude => {
    // Verifica si el RUDE escaneado corresponde a un estudiante en la lista actual
    const estudianteExiste = asistencias.some(est => est.RUDE === rude);

    if (estudianteExiste) {
      // Cambia el estado a 'presente' para cada RUDE válido
      cambiarEstado(rude, 'presente');
      estudiantesEncontrados++;
    } else {
      console.warn(`⚠️ RUDE ${rude} escaneado pero no encontrado en la lista actual del curso.`);
      estudiantesNoEncontrados.push(rude);
    }
  });

  let alertMessage = `${estudiantesEncontrados} asistencia(s) registrada(s).`;
  if (estudiantesNoEncontrados.length > 0) {
    alertMessage += `\n\nLos siguientes RUDEs no se encontraron en este curso: ${estudiantesNoEncontrados.join(', ')}`;
  }

  Alert.alert("Escaneo Completado", alertMessage);
};
// --- Fin de la función ---
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
        extraData={asistencias} // Ayuda a FlatList a saber cuándo re-renderizar items
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
      {/* --- Modal del Escáner QR --- */}
      <Modal
        visible={isScannerVisible}
        animationType="slide" // Opcional: añade una animación
        onRequestClose={() => setIsScannerVisible(false)} // Para el botón de atrás en Android
      >
        <MultipleQRScanner
          onClose={() => setIsScannerVisible(false)}
          onQRsScanned={handleQRsScanned} // Pasa la función de manejo
        />
      </Modal>
      {/* --- Fin Modal Escáner --- */}
      {/* Modal de menú general */}
      <Modal visible={menuVisible} transparent animationType="fade">
        {/* Contenedor para oscurecer el fondo */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)} // Cierra el modal al tocar fuera
        >
        <View style={styles.modalMenu} 
        // Evita que el toque dentro del menú lo cierre
        onStartShouldSetResponder={() => true}
        >
        <TouchableOpacity style={styles.menuItem} onPress={() => {
                setIsScannerVisible(true); // Abre el escáner
                setMenuVisible(false); // Cierra el menú
              }}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#555" />
              <Text style={styles.menuText}>📸 Escanear Múltiples QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { totalAsistencia(); setMenuVisible(false); }}>
              <MaterialIcons name="playlist-add-check" size={24} color="green" />
              <Text style={styles.menuText}>✅ Marcar Todos Presentes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => { marcarFaltas(); setMenuVisible(false); }}>
               <MaterialIcons name="person-add-disabled" size={24} color="red" />
              <Text style={styles.menuText}>❌ Rellenar Ausentes</Text>
            </TouchableOpacity>
          {/* <TouchableOpacity>
            <Text>📚 Actividad Grupal</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={[styles.menuItem, styles.menuItemDelete]} onPress={() => {
                 Alert.alert(
                     "Confirmar Borrado",
                     `¿Seguro que quieres borrar toda la asistencia del ${fechaSeleccionada}? Esta acción no se puede deshacer.`,
                     [
                         { text: "Cancelar", style: "cancel" },
                         { text: "Borrar", style: "destructive", onPress: () => { borrarAsistencia(); setMenuVisible(false); } }
                     ]
                 );
             }}>
               <MaterialIcons name="delete-sweep" size={24} color="darkred" />
              <Text style={[styles.menuText, styles.menuTextDelete]}>🗑️ Borrar Asistencia del Día</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setMenuVisible(false)}>
              <MaterialIcons name="close" size={24} color="#555" />
              <Text style={styles.menuText}>🚫 Cerrar Menú</Text>
            </TouchableOpacity>
        </View>
        </TouchableOpacity>
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

// --- Estilos (Añadidos/Modificados) ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  fecha: { fontSize: 18, fontWeight: "bold" },
  resumen: { flexDirection: "row", gap: 10, alignItems: 'center' },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // Sombra sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  nombre: { flex: 1, fontSize: 16, marginRight: 10 },
  botonesEstado: { flexDirection: "row", gap: 10 },
  modalOverlay: { // Para el fondo semitransparente del menú
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Fondo oscuro semitransparente
    justifyContent: 'center', // Centra el contenido del modal (el menú)
    alignItems: 'center',
  },
  modalMenu: { // Estilo para la caja del menú en sí
    width: '80%', // Ancho del menú
    maxWidth: 350, // Ancho máximo
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10, // Espaciado vertical interno
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  menuItemDelete: {
    // Estilos específicos para el botón de borrar si quieres
  },
  menuTextDelete: {
    color: 'darkred', // Color del texto para borrar
    fontWeight: 'bold',
  },
  // Estilos para el modal de opciones de estudiante (si lo usas)
  modal: { // Reutilizado del código original, ajusta si es necesario
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // Posicionamiento si no usas overlay
    // position: 'absolute',
    // top: '30%',
    // left: '10%',
    // right: '10%',
  },
});

export default RegistroAsistencia;