import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { Camera, CameraType } from "expo-camera";

export default function QRScanner({ onScan }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(CameraType.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(
      "Código QR Escaneado",
      `Tipo: ${type}\nContenido: ${data}`,
      [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            if (onScan) onScan(data);
          },
        },
      ]
    );
  };

  const toggleCameraType = () => {
    setType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando acceso a la cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No se concedió acceso a la cámara</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [
            "qr",
            "pdf417",
            "ean13",
            "code128",
            "code39",
            "code93",
          ],
        }}
      >
        <View style={styles.buttonContainer}>
          <Button
            title="Cambiar Cámara"
            onPress={toggleCameraType}
          />
        </View>
      </Camera>
      <Text style={styles.info}>Escanea un código QR</Text>
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
  camera: {
    width: "100%",
    height: "80%",
  },
  info: {
    fontSize: 18,
    color: "white",
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});