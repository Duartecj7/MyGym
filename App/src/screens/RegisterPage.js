import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SocialButton from '../components/SocialButton';
import BackgroundWrapper from '../components/BackgroundWrapper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As passwords não coincidem');
      return;
    }
  
    if (email && password) {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  
        const userId = userCredential.user.uid;
  
        await firestore().collection('clientes').doc(userId).set({
          email: email,
          password: password,
          dataCriacao: new Date().toISOString(),
          ativo: true,
          roles: "cliente"
        });
  
        Alert.alert('Sucesso', 'Utilizador criado e registado!');
        navigation.navigate('Login');
      } catch (err) {
        console.log(err);
        const errorMessage = err.message || 'Falha a criar a conta. Tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos');
    }
  };

  const handleSocialLogin = (platform) => {
    Alert.alert(`Registar com ${platform}`, `A redirecionar para ${platform}`);
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Registe-se</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registo</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Ou registe-se com:</Text>

        <View style={styles.socialButtonsContainer}>
          <SocialButton
            imageSource={require('../assets/images/gmailLogo.png')}
            onPress={() => handleSocialLogin('Gmail')}
          />
          <SocialButton
            imageSource={require('../assets/images/twitterLogo.png')}
            onPress={() => handleSocialLogin('Twitter')}
          />
          <SocialButton
            imageSource={require('../assets/images/facebookLogo.png')}
            onPress={() => handleSocialLogin('Facebook')}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Já tem uma conta? Faça Login!</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
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
  socialButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  link: {
    color: '#007BFF',
    marginTop: 20,
    backgroundColor: 'black',
  },
});

export default RegisterPage;
