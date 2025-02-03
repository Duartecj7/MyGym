import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native'; // Importa o hook useRoute

const MenuUser = ({ navigation }) => {
  const route = useRoute(); // Usa o hook useRoute para obter a rota atual
  const { role, clientEmail, gymId } = route.params; 
  console.log("Ginásio ID:"+gymId);
  const clientButtons  = [
    { id: 1, title: 'Perfil', image: require('../assets/images/profile.png'), screen: 'User' },  
    { id: 2, title: 'Treinadores', image: require('../assets/images/treinador.png') },
    { id: 3, title: 'Agenda', image: require('../assets/images/treinos.png'), screen:'TreinosUtilizador' },
    { id: 4, title: 'Exercícios', image: require('../assets/images/exercicio.png') },
    { id: 5, title: 'Pagamentos', image: require('../assets/images/payment.png') },
    { id: 6, title: 'Avaliações Antropométricas', image: require('../assets/images/evaluation.png'), screen: 'AvaliacoesAntropometricas' },
    { id: 7, title: 'Modalidades', image: require('../assets/images/modalidades.png') },
    { id: 8, title: 'Ginásio', image: require('../assets/images/gym.png') },
    { id: 9, title: 'Configurações', image: require('../assets/images/configuracoes.png') },
  ];

  const adminButtons = [
    { id: 1, title: 'Utilizadores', image: require('../assets/images/profile.png'), screen:"ListaUtilizadores" },
    { id: 2, title: 'Treinos Agendados', image: require('../assets/images/profile.png'), screen:"TreinosTreinador" },
    { id: 3, title: 'Exercicios', image: require('../assets/images/profile.png') , screen:"AdicionarExercicios" },
    { id: 4, title: 'Treino', image: require('../assets/images/profile.png'), screen:"CriarTreino" },
    { id: 5, title: 'Modalidades', image: require('../assets/images/profile.png'), screen:"Modalidades" },

  ];

  const buttons = role === 'admin' ? adminButtons : clientButtons;
  return (
    <ScrollView>
      <View style={styles.container}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={button.id}
            style={[styles.button, 
                    index % 3 === 0 && { marginLeft: 0 }, 
                    (index + 1) % 3 === 0 && { marginRight: 0 },
                  ]}
            onPress={() => {
              if (button.screen) {
                navigation.navigate(button.screen, { 
                  clientEmail: clientEmail, 
                  gymId: gymId  // Passando o ID do ginásio aqui
                });
              }
            }}
          >
            <Image source={button.image} style={styles.image} />
            <View style={styles.titleContainer}>
              <Text style={styles.buttonText}>{button.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    flex: 1,
  },
  button: {
    width: '30%',
    aspectRatio: 1,
  marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, 
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '75%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 8,
  },
  titleContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MenuUser;
