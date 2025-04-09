// En tu pantalla de RegistroAsistencia.js o una nueva pantalla de Participación

import MultipleQRScanner from "./MultipleQRScanner"; // O como lo hayas llamado
// ... otros imports ...

const RegistroParticipacion = () => {
  // ... estados existentes (asistencias, fecha, etc.) ...
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [currentScanMode, setCurrentScanMode] = useState('asistencia'); // 'asistencia' o 'participacion'
  const [participations, setParticipations] = useState({}); // Ej: { "RUDE1": "A", "RUDE2": "C" }

  // --- Callback para Asistencia ---
  const handleQRsScanned = (scannedRudes) => {
    console.log("✅ Asistencia recibida:", scannedRudes);
    setIsScannerVisible(false);
    // ... (tu lógica existente para marcar asistencia) ...
    scannedRudes.forEach(rude => cambiarEstado(rude, 'presente'));
    Alert.alert("Asistencia Registrada", `${scannedRudes.length} asistencia(s) marcada(s).`);
  };

  // --- NUEVO Callback para Participación ---
  const handleParticipationScanned = (participationData) => {
     // participationData es un array de: [{ rude: '...', choice: '...' }, ...]
     console.log("✅ Participación recibida:", participationData);
     setIsScannerVisible(false);

     // Actualizar el estado de participaciones (sobrescribiendo la anterior si escanean de nuevo)
     const newParticipations = { ...participations };
     let count = 0;
     participationData.forEach(item => {
        // Aquí decides cómo almacenar/mostrar. Podrías guardar solo la última.
        newParticipations[item.rude] = item.choice;
        count++;
     });
     setParticipations(newParticipations);

     // Muestra feedback
     Alert.alert("Participación Registrada", `${count} participaciones registradas/actualizadas.`);
     console.log("Estado de participaciones actualizado:", newParticipations);

     // Aquí podrías enviar 'newParticipations' al backend si es necesario
     // sendParticipationToBackend(newParticipations);
  };

  // --- Función para abrir el escáner en un modo específico ---
  const openScanner = (mode) => {
    setCurrentScanMode(mode);
    setIsScannerVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* ... tu UI existente (header, lista, etc.) ... */}

      {/* Podrías añadir una sección para mostrar las participaciones */}
       <View style={styles.participationSection}>
           <Text style={styles.sectionTitle}>Participaciones del Día:</Text>
           {Object.keys(participations).length === 0 ? (
               <Text>Aún no hay participaciones registradas.</Text>
           ) : (
               <View>
                   {Object.entries(participations).map(([rude, choice]) => {
                       // Busca el nombre del estudiante para mostrarlo
                       const student = asistencias.find(a => a.RUDE === rude);
                       const studentName = student ? student.nombre : `RUDE ${rude}`;
                       return (
                           <Text key={rude}>{`${studentName} eligió: ${choice}`}</Text>
                       );
                   })}
               </View>
           )}
            {/* Botón para iniciar escaneo de participación */}
           <Button title="Escanear Participación (A/B/C/D)" onPress={() => openScanner('participacion')} />
       </View>


      {/* Modal del Escáner (Ahora pasa el modo y los callbacks correctos) */}
      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <MultipleQRScanner
          scanMode={currentScanMode} // Pasa el modo actual
          onClose={() => setIsScannerVisible(false)}
          // Pasa el callback correspondiente según el modo
          onQRsScanned={currentScanMode === 'asistencia' ? handleQRsScanned : undefined}
          onParticipationScanned={currentScanMode === 'participacion' ? handleParticipationScanned : undefined}
        />
      </Modal>

      {/* Modal de Menú General (Modificar botones para elegir modo) */}
      <Modal visible={menuVisible} /* ... */ >
         <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
         >
           <View style={styles.modalMenu} onStartShouldSetResponder={() => true}>
             {/* Botón para Asistencia */}
             <TouchableOpacity style={styles.menuItem} onPress={() => {
                 openScanner('asistencia'); // Abre en modo asistencia
                 setMenuVisible(false);
               }}>
               <MaterialIcons name="qr-code-scanner" size={24} color="#555" />
               <Text style={styles.menuText}>📸 Escanear Asistencia</Text>
             </TouchableOpacity>

             {/* Botón para Participación */}
             <TouchableOpacity style={styles.menuItem} onPress={() => {
                 openScanner('participacion'); // Abre en modo participación
                 setMenuVisible(false);
               }}>
               <MaterialIcons name="rule" size={24} color="#3f51b5" />
               <Text style={styles.menuText}>🙋 Escanear Participación</Text>
             </TouchableOpacity>

             {/* ... otros botones del menú (Marcar Todos, Borrar, etc.) ... */}
             <TouchableOpacity style={styles.menuItem} onPress={() => { totalAsistencia(); setMenuVisible(false); }}>
              <MaterialIcons name="playlist-add-check" size={24} color="green" />
              <Text style={styles.menuText}>✅ Marcar Todos Presentes</Text>
             </TouchableOpacity>
             {/* ... resto ... */}
               <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setMenuVisible(false)}>
                 <MaterialIcons name="close" size={24} color="#555" />
                 <Text style={styles.menuText}>🚫 Cerrar Menú</Text>
               </TouchableOpacity>
           </View>
         </TouchableOpacity>
      </Modal>

      {/* ... resto de tu componente ... */}
    </View>
  );
};

// --- Añade estilos para la sección de participación si es necesario ---
const styles = StyleSheet.create({
    // ... tus estilos existentes ...
    participationSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    // Asegúrate de tener todos los estilos del componente anterior y los del menú
    container: { flex: 1, padding: 10, backgroundColor: "#F5F5F5" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    fecha: { fontSize: 18, fontWeight: "bold" },
    resumen: { flexDirection: "row", gap: 10, alignItems: 'center' },
    card: { /* ... */ },
    nombre: { /* ... */ },
    botonesEstado: { /* ... */ },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalMenu: { width: '80%', maxWidth: 350, backgroundColor: "white", borderRadius: 10, paddingVertical: 10, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    menuText: { marginLeft: 15, fontSize: 16, color: '#333' },
    modal: { /* ... (estilo del modal de estudiante si lo usas) ... */ },
});

export default RegistroParticipacion;