import 'react-native-gesture-handler';
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext, AuthProvider } from "./context/AuthContext"; // Importa AuthProvider
import Login from "./screens/Login";
//import Home from "./screens/Home";
//import NotasPorAlumno from "./screens/NotasPorAlumno";
import MainApp from "./MainApp"; // Importa MainApp

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider> {/* Envuelve la aplicación en AuthProvider */}
      <NavigationContainer>
        <AuthConsumer />
      </NavigationContainer>
    </AuthProvider>
  );
}

// Componente separado para consumir el contexto
function AuthConsumer() {
  const { isAuthenticated,tipoUsuario  } = useContext(AuthContext); // Aquí ya no habrá error

  return (
    

    <Stack.Navigator>
    {!isAuthenticated ? (
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    ) : (
      <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
    )}
  </Stack.Navigator>
  
  );
}
