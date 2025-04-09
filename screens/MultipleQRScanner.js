// MultipleQRScanner.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native'; // Añadir ActivityIndicator
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function MultipleQRScanner({ onClose, onQRsScanned }) {
  // --- 1. Llama a TODOS los hooks incondicionalmente ---
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCodes, setScannedCodes] = useState(new Set());
  const [isCameraReady, setIsCameraReady] = useState(false);

  // --- 2. Define useEffect (también incondicional) ---
  useEffect(() => {
    console.log("Scanner mounted, clearing codes.");
    setScannedCodes(new Set());
    // Opcional: solicitar permiso si no se ha determinado al montar
    // if (permission && !permission.granted && permission.canAskAgain) {
    //   requestPermission();
    // }
  }, []); // El array vacío significa que solo se ejecuta al montar

  // --- 3. Define los handlers (no son hooks) ---
  const handleBarCodeScanned = (scanningResult) => {
    // ... (lógica interna sin cambios) ...
    console.log("--- Scanner Event Fired ---"); // Mantén tus logs para depurar
    console.log("Raw Scanning Result:", JSON.stringify(scanningResult, null, 2));

    if (scanningResult && scanningResult.type === 'qr' && scanningResult.data) {
      const currentCodes = new Set(scannedCodes);
      if (!currentCodes.has(scanningResult.data)) {
        console.log(`✅ ADDING New QR Code: ${scanningResult.data}`);
        const newCodes = new Set(currentCodes);
        newCodes.add(scanningResult.data);
        setScannedCodes(newCodes);
         console.log('🔄 State updated. New codes count:', newCodes.size);
      } else {
        // console.log(`🏁 Already scanned: ${scanningResult.data}`); // Opcional: log si ya existe
      }
    } else { /* ... logs de ignorados ... */ }
  };

  const confirmScan = () => {
    // ... (lógica interna sin cambios) ...
     if (scannedCodes.size > 0) {
      const codesArray = Array.from(scannedCodes);
       console.log("Confirming scan with codes:", codesArray);
      onQRsScanned(codesArray);
      setScannedCodes(new Set());
      // onClose();
    } else {
      Alert.alert("Sin Códigos", "Apunta la cámara a uno o más códigos QR.");
    }
  };

  // --- 4. Lógica condicional para decidir QUÉ RENDERIZAR ---

  // Estado de carga inicial de permisos
  if (!permission) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Cargando permisos...</Text>
      </View>
    );
  }

  // Estado de permisos no concedidos
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        {/* Muestra el botón para pedir permiso solo si se puede volver a pedir */}
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

  // Estado normal: Permisos concedidos, renderiza la cámara
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={'back'}
        onCameraReady={() => {
             console.log("Camera is ready!");
             setIsCameraReady(true);
        }}
        onBarcodeScanned={isCameraReady ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay y botones */}
        {isCameraReady && (
          <View style={styles.overlay}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {scannedCodes.size} QR detectado(s)
              </Text>
              <Text style={styles.infoDetail}>
                {Array.from(scannedCodes).slice(0, 3).join(', ')}{scannedCodes.size > 3 ? '...' : ''}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Confirmar Asistencia"
                  onPress={confirmScan}
                  color="#4CAF50"
                  disabled={scannedCodes.size === 0}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button title="Cerrar Escáner" onPress={onClose} color="#f44336"/>
              </View>
            </View>
          </View>
        )}
        {/* Indicador mientras la cámara no está lista */}
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

// --- Estilos (sin cambios relevantes, asegúrate de tenerlos todos) ---
const styles = StyleSheet.create({
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
     backgroundColor: '#f5f5f5', // Un fondo para la pantalla de permisos
  },
  message: {
    textAlign: 'center',
    paddingBottom: 15,
    fontSize: 16,
    color: '#333', // Color de texto más oscuro
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
    // No es necesario el backgroundColor aquí si los botones internos lo tienen
  },
});