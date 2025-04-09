// MultipleQRScanner.js (Modificado para Participación)
// O considera renombrar a ParticipationScanner.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Nueva interfaz/tipo para la data de participación (opcional pero bueno para claridad)
// interface ParticipationData {
//   rude: string;
//   choice: string;
// }

// Añadimos una prop 'scanMode' para diferenciar entre 'asistencia' y 'participacion'
export default function ParticipationScanner({
  onClose,
  onQRsScanned, // Para asistencia (devuelve array de RUDEs)
  onParticipationScanned, // Para participación (devuelve array de {rude, choice})
  scanMode = 'asistencia' // Valor por defecto
}) {
  // --- Hooks (sin cambios) ---
  const [permission, requestPermission] = useCameraPermissions();
  // Ahora el Set almacenará la cadena completa "RUDE:CHOICE" o solo RUDE
  const [scannedItems, setScannedItems] = useState(new Set());
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Limpiar al montar o al cambiar el modo de escaneo
  useEffect(() => {
    console.log(`Scanner mounted in ${scanMode} mode, clearing items.`);
    setScannedItems(new Set());
    setIsCameraReady(false); // Reiniciar cámara lista también
  }, [scanMode]);

  // --- Handlers ---
  const handleBarCodeScanned = (scanningResult) => {
    console.log("--- Scanner Event Fired ---");
    // console.log("Raw Scanning Result:", JSON.stringify(scanningResult, null, 2)); // Descomenta si necesitas depurar

    if (scanningResult && scanningResult.type === 'qr' && scanningResult.data) {
      const rawData = scanningResult.data;
      let itemToAdd = null;
      let isValid = false;

      if (scanMode === 'participacion') {
        // Parsear para RUDE:CHOICE
        const parts = rawData.split(':');
        if (parts.length === 2) {
          const rude = parts[0];
          const choice = parts[1].toUpperCase(); // Asegura mayúsculas para A,B,C,D
          // Validar que la opción sea una de las esperadas
          if (['A', 'B', 'C', 'D'].includes(choice)) {
            itemToAdd = `${rude}:${choice}`; // Almacena la cadena completa para unicidad
            isValid = true;
            console.log(`Parsed Participation: RUDE=${rude}, Choice=${choice}`);
          } else {
             console.log(`   ⚠️ Ignored: Invalid choice "${choice}" in ${rawData}`);
          }
        } else {
          console.log(`   ⚠️ Ignored: Invalid format for participation "${rawData}". Expected "RUDE:CHOICE".`);
        }
      } else { // Modo asistencia
        // Asumimos que el dato es directamente el RUDE
        // Podrías añadir validación de formato RUDE aquí si quieres
        itemToAdd = rawData;
        isValid = true;
         console.log(`Parsed Assistance: RUDE=${rawData}`);
      }

      // Si el item es válido y no está ya en el Set
      if (isValid && itemToAdd && !scannedItems.has(itemToAdd)) {
        console.log(`✅ ADDING New Item: ${itemToAdd}`);
        const newItems = new Set(scannedItems);
        newItems.add(itemToAdd);
        setScannedItems(newItems);
         console.log('🔄 State updated. New items count:', newItems.size);
      } else if (isValid && itemToAdd && scannedItems.has(itemToAdd)) {
         // console.log(`🏁 Already scanned: ${itemToAdd}`);
      }

    } else { /* ... logs de no QR / sin datos ... */ }
  };

  const confirmScan = () => {
    if (scannedItems.size === 0) {
       Alert.alert("Sin Datos", `Apunta la cámara a los códigos QR (${scanMode === 'participacion' ? 'A, B, C o D' : 'de asistencia'}).`);
      return;
    }

    const itemsArray = Array.from(scannedItems);
    console.log(`Confirming scan (${scanMode}) with items:`, itemsArray);

    if (scanMode === 'participacion' && onParticipationScanned) {
      // Convertir ["RUDE:CHOICE", ...] a [{rude, choice}, ...]
      const participationData = itemsArray.map(item => {
        const parts = item.split(':');
        return { rude: parts[0], choice: parts[1] };
      }).filter(p => p.rude && p.choice); // Filtro extra de seguridad

       console.log("Calling onParticipationScanned with:", participationData);
      onParticipationScanned(participationData);

    } else if (scanMode === 'asistencia' && onQRsScanned) {
      // Ya tenemos el array de RUDEs
       console.log("Calling onQRsScanned with:", itemsArray);
      onQRsScanned(itemsArray);

    } else {
       console.error("Error: Callback function not provided for the current scanMode!");
       Alert.alert("Error de Configuración", "Falta la función de callback para este modo.");
    }

    setScannedItems(new Set()); // Limpiar después de confirmar
    // onClose(); // Decide si cerrar automáticamente
  };

  // --- Lógica de Renderizado (similar a antes) ---
  if (!permission) { /* ... render loading ... */
     return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Cargando permisos...</Text>
      </View>
    );
  }
  if (!permission.granted) { /* ... render permission request ... */
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        {permission.canAskAgain && (
             <Button onPress={requestPermission} title="Conceder permiso" />
        )}
         {!permission.canAskAgain && (
             <Text style={styles.message}>Debes habilitar el permiso desde los ajustes de la aplicación.</Text>
         )}
        <View style={{ marginTop: 20 }}>
          <Button onPress={onClose} title="Cancelar" color="gray" />
        </View>
      </View>
    );
   }

  // Render Cámara
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={'back'}
        onCameraReady={() => {
             if (!isCameraReady) { // Evitar logs repetidos si ya estaba lista
                 console.log("Camera is ready!");
                 setIsCameraReady(true);
             }
        }}
        onBarcodeScanned={isCameraReady ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        {isCameraReady && (
          <View style={styles.overlay}>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {scannedItems.size} Escaneado(s)
                 {/* Pequeño texto indicando el modo */}
                 <Text style={{fontSize: 10, color: 'lightgrey'}}> ({scanMode})</Text>
              </Text>
              <Text style={styles.infoDetail} numberOfLines={2}>
                  {/* Muestra los últimos items escaneados */}
                  {Array.from(scannedItems).slice(-3).reverse().join(' | ')}
              </Text>
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  // Título dinámico del botón
                  title={`Confirmar ${scanMode === 'participacion' ? 'Participación' : 'Asistencia'}`}
                  onPress={confirmScan}
                  color="#4CAF50"
                  disabled={scannedItems.size === 0}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button title="Cerrar Escáner" onPress={onClose} color="#f44336"/>
              </View>
            </View>
          </View>
        )}
        {/* Loading Cámara */}
        {!isCameraReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF"/>
            <Text style={styles.loadingText}>Iniciando cámara...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

// --- Estilos (iguales que antes) ---
const styles = StyleSheet.create({
  // ... Copia todos los estilos de la versión anterior ...
   container: {
    flex: 1,
  },
   loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
      color: 'white',
      fontSize: 18,
      marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
     backgroundColor: '#f5f5f5',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 40,
    minWidth: 150, // Ancho mínimo para el texto
    alignItems: 'center', // Centrar texto
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  infoDetail: {
    fontSize: 12,
    color: 'lightgray',
    textAlign: 'center',
    marginTop: 5,
    maxWidth: '90%', // Evitar que el texto se salga
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonWrapper: {
    width: '80%',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});