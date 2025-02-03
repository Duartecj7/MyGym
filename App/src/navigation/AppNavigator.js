import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import HomePage from '../screens/HomePage';
import UserPage from '../screens/UserPage';
import AvaliacoesAntropometricasPage from '../screens/AvaliacoesAntropometricasPage';
import AdicionarExercicioPage from '../screens/AdicionarExerciciosPage';
import ListaUtilizadoresPage from '../screens/ListaUtilizadoresPage';
import CriarTreinoPage from '../screens/CriarTreinoPage';
import TreinosTreinadorPage from '../screens/TreinosTreinadorPage';
import TreinosUtilizadorPage from '../screens/TreinosUtilizadorPage';
import GinasiosPage from '../screens/GinasiosPage';
import ModalidadesTreinadorPage from '../screens/ModalidadesTreinadorPage'
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Ginasios">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="User" component={UserPage}/>
        <Stack.Screen name="AvaliacoesAntropometricas" component={AvaliacoesAntropometricasPage}  options={{ title: 'Avaliações' }} />
        <Stack.Screen name="AdicionarExercicios" component={AdicionarExercicioPage} options={{ title: 'Adicionar Exercício' }} />
        <Stack.Screen name="ListaUtilizadores" component={ListaUtilizadoresPage} options={{ title: 'Lista Utilizadores' }} />
        <Stack.Screen name="CriarTreino" component={CriarTreinoPage} options={{ title: 'Criar Treino' }} />
        <Stack.Screen name="TreinosTreinador" component={TreinosTreinadorPage} options={{ title: 'Treinos Agendados' }} />
        <Stack.Screen name="TreinosUtilizador" component={TreinosUtilizadorPage} options={{ title: 'Treinos Agendados' }} />
        <Stack.Screen name="Ginasios" component={GinasiosPage} options= {{title: 'Ginásios'}} />
        <Stack.Screen name="Modalidades" component={ModalidadesTreinadorPage} options= {{title: 'Modalidades'}} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
