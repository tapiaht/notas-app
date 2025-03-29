// import React, { useContext } from "react";
// import { createDrawerNavigator } from "@react-navigation/drawer";
// import Home from "./screens/Home";
// import NotasTodasMaterias from "./screens/NotasTodasMaterias";
// import NotasPorMateria from "./screens/NotasPorMateria";
// import NotasPorAlumno from "./screens/NotasPorAlumno";
// import Login from "./screens/Login";
// import { AuthContext } from "./context/AuthContext";
// const Drawer = createDrawerNavigator();

// export default function MainApp() {
//   const { tipoUsuario } = useContext(AuthContext);
//   return (
//     <Drawer.Navigator initialRouteName="Perfil">
//       <Drawer.Screen name="Perfil" component={Home} />
//        {tipoUsuario === "docente" ? (
//         <>
      
//       <Drawer.Screen name="Login" component={Login} />
//       <Drawer.Screen name="Todas las Materias" component={NotasTodasMaterias} />
//       <Drawer.Screen name="Por Materia y Trimestre" component={NotasPorMateria} />      
//       </>
//        ) : null}
        
//         <Drawer.Screen name="Por Alumno" component={NotasPorAlumno} />
//     </Drawer.Navigator>
//   );
// }
import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Importa iconos
import Home from "./screens/Home";
import NotasTodasMaterias from "./screens/NotasTodasMaterias";
import NotasPorMateria from "./screens/NotasPorMateria";
import NotasPorAlumno from "./screens/NotasPorAlumno";
import Login from "./screens/Login";
import { AuthContext } from "./context/AuthContext";
import RegistroAsistencia from "./screens/RegistroAsistencia";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

export default function MainApp({ navigation }) {
  const { tipoUsuario, logout } = useContext(AuthContext); // Obtener tipo de usuario y función de logout

  return (
    <Drawer.Navigator
      initialRouteName="Perfil"
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
            <MaterialIcons name="exit-to-app" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Perfil" component={Home} />
      {tipoUsuario === "docente" ? (
        <>
          <Drawer.Screen name="Todas las Materias" component={NotasTodasMaterias} />
          <Drawer.Screen name="Por Materia y Trimestre" component={NotasPorMateria} />
          <Drawer.Screen name="Asistencia" component={RegistroAsistencia} />
        </>
      ) : (
        <Drawer.Screen name="Por Alumno" component={NotasPorAlumno} />
      )}
    </Drawer.Navigator>
  );
}
