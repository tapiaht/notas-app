import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import NotasTodasMaterias from './screens/NotasTodasMaterias';
import NotasPorMateria from './screens/NotasPorMateria';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Todas las Materias">
        <Drawer.Screen name="Todas las Materias" component={NotasTodasMaterias} />
        <Drawer.Screen name="Por Materia y Trimestre" component={NotasPorMateria} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
