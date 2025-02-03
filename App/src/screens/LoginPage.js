import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SocialButton from '../components/SocialButton';
import TextInputField from '../components/TextInputField';
import BackgroundWrapper from '../components/BackgroundWrapper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginPage = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymName, setGymName] = useState('');
  const [users, setUsers] = useState([]);
  
  const { gymId } = route.params;

  useEffect(() => {
    const fetchGymData = async () => {
      try {
        const gymDoc = await firestore().collection('ginasios').doc(gymId).get();
        if (gymDoc.exists) {
          setGymName(gymDoc.data().name);
          const usersSnapshot = await gymDoc.ref.collection('utilizadores').get();
          setUsers(usersSnapshot.docs.map(doc => doc.data()));
        } else {
          Alert.alert('Erro', 'Ginásio não encontrado!');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ginásio:', error);
      }
    };
    
    fetchGymData();
  }, [gymId]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha ambos os campos');
      return;
    }
  
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
      Alert.alert('Erro', 'Credenciais inválidas ou usuário não pertence a este ginásio!');
      return;
    }
  
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Sucesso', `Bem-vindo, ${user.nome}!`);
      navigation.navigate('Home', { role: user.role, gymId: gymId ,clientEmail: user.email});
    } catch (err) {
      console.error('Erro ao autenticar:', err);
      Alert.alert('Erro', 'Falha ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.gymName}>{gymName}</Text>
        <TextInputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>Ou entre com:</Text>
        <View style={styles.socialButtonsContainer}>
          <SocialButton imageSource={require('../assets/images/gmailLogo.png')} onPress={() => Alert.alert('Login com Gmail')} />
          <SocialButton imageSource={require('../assets/images/twitterLogo.png')} onPress={() => Alert.alert('Login com Twitter')} />
          <SocialButton imageSource={require('../assets/images/facebookLogo.png')} onPress={() => Alert.alert('Login com Facebook')} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Register', { gymId: gymId })}>
          <Text style={styles.link}>Não tem uma conta? Registe-se !!</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 15,
    fontSize: 16,
    color: '#666',
    backgroundColor: 'black',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  link: {
    color: '#007BFF',
    marginTop: 20,
    backgroundColor: 'black',
  },
});

export default LoginPage;
