import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import BackgroundWrapper from '../components/BackgroundWrapper';

const UserPage = () => {
  const [email, setEmail] = useState('');
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidPassword, setIsValidPassword] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email); 
      } else {
        setEmail(''); 
        navigation.navigate('Login'); 
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setIsValidPassword(false);
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    const user = auth().currentUser;

    if (user) {
      user
        .updatePassword(newPassword)
        .then(() => {
          Alert.alert('Sucesso', 'Password alterada com sucesso!');
          setNewPassword('');
          setConfirmPassword('');
          setIsPasswordChange(false);
        })
        .catch((error) => {
          Alert.alert('Erro', error.message || 'Não foi possível alterar a password.');
        });
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Informações do utilizador</Text>

          <Text style={styles.label}>E-mail: {email}</Text>

          <View style={styles.checkboxContainer}>
            <CheckBox value={isPasswordChange} onValueChange={setIsPasswordChange} />
            <Text style={styles.checkboxLabel}>Deseja mudar a password?</Text>
          </View>

          {isPasswordChange && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nova password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {!isValidPassword && <Text style={styles.errorText}>As passwords não coincidem!</Text>}
            </>
          )}

          {isPasswordChange && (
            <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
              <Text style={styles.buttonText}>Alterar Senha</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  innerContainer: {
    backgroundColor: 'white', 
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, 
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

export default UserPage;
