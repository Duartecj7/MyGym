import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SocialButton from '../components/SocialButton';
import TextInputField from '../components/TextInputField';
import BackgroundWrapper from '../components/BackgroundWrapper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
          const userId = userCredential.user.uid;
          const userDoc = await firestore().collection('clientes').doc(userId).get();
          const role = userDoc.data().roles; 
          Alert.alert('Sucesso', `Bem-vindo, ${email}!`);
          navigation.navigate('Home', { role : userDoc.data().roles , clienteId: userId}); 
        })
        .catch((err) => {
          console.log(err);
          const errorMessage = err.message || 'Falha a fazer login. Tente novamente.';
          Alert.alert('Erro', errorMessage);
        });
    } else {
      Alert.alert('Erro', 'Preencha ambos os campos');
    }
  };
  

  const handleSocialLogin = (platform) => {
    Alert.alert(`Login com ${platform}`, `Redirecionando para o ${platform}`);
  };

  return (
    <BackgroundWrapper>
     
    <View style={styles.container}>
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
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
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
    backgroundColor:"black"
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
    backgroundColor:"black"
  },
});

export default LoginPage;
