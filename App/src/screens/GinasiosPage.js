import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GinasiosPage = ({ navigation }) => {
  const [gyms, setGyms] = useState([]);
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [daysOfOperation, setDaysOfOperation] = useState([]);
  const [openHour, setOpenHour] = useState('00');
  const [openMinute, setOpenMinute] = useState('00');
  const [closeHour, setCloseHour] = useState('00');
  const [closeMinute, setCloseMinute] = useState('00');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gymPassword, setGymPassword] = useState('');
  const [isCreatingGym, setIsCreatingGym] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);

  useEffect(() => {
    const fetchGyms = async () => {
      const gymsSnapshot = await firestore().collection('ginasios').get();
      if (!gymsSnapshot.empty) {
        setGyms(gymsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchGyms();
  }, []);

  const validateGymFields = () => {
    if (!newGymName || !newGymLocation || daysOfOperation.length === 0 || !gymPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do ginásio.');
      return false;
    }
    return true;
  };

  const validateAdminFields = () => {
    if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do utilizador admin.');
      return false;
    }

    if (adminPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }

    return true;
  };

  const handleCreateAdminUser = async () => {
    if (!validateAdminFields()) return;
  
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(adminEmail, adminPassword);
      const userId = userCredential.user.uid;
  
      if (validateGymFields()) {
        // Criando o ginásio e obtendo o ID do documento criado
        const gymRef = await firestore().collection('ginasios').add({
          name: newGymName,
          location: newGymLocation,
          daysOfOperation: daysOfOperation,
          operationHours: `${openHour}:${openMinute} - ${closeHour}:${closeMinute}`,
          createdAt: new Date().toISOString(),
          password: gymPassword,
        });
  
        const gymId = gymRef.id; 
  
        await firestore().collection('ginasios').doc(gymId).collection('utilizadores').doc(userId).set({
          nome: adminName,
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          DataCriacao: new Date().toISOString(),
          gymId: gymId
        });
  
        Alert.alert('Sucesso', 'Ginásio e utilizador admin criados com sucesso!');
  
        setNewGymName('');
        setNewGymLocation('');
        setDaysOfOperation([]);
        setOpenHour('00');
        setOpenMinute('00');
        setCloseHour('00');
        setCloseMinute('00');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setConfirmPassword('');
        setGymPassword('');
        setIsCreatingGym(false);
        setIsCreatingAdmin(false);
  
        navigation.navigate('Login', { gymId });
  
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar o utilizador admin ou o ginásio.');
    }
  };
  
  const handleCreateGym = () => {
    setIsCreatingGym(true);
  };

  const handleContinueToAdminCreation = () => {
    setIsCreatingAdmin(true);
  };

  const toggleDayOfOperation = (day) => {
    setDaysOfOperation((prev) =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGymSelection = (gym) => {
    setSelectedGym(gym);
    setIsPasswordModalVisible(true);
  };

  const handlePasswordSubmit = () => {
    if (selectedGym && gymPassword === selectedGym.password) {
      setIsPasswordModalVisible(false);
      navigation.navigate('Login', { gymId: selectedGym.id });
    } else {
      alert('Senha incorreta. Tente novamente.');
    }
  };
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>Selecione ou 
      <TouchableOpacity onPress={handleCreateGym} style={styles.clickableTitleButton}>
        <Text style={styles.clickableTitle}> Crie um Ginásio</Text>
      </TouchableOpacity>
      </Text>

      {gyms.length === 0 ? (
  <View>
    <Text style={styles.noGymsText}>Não existem ginásios. Deseja criar um?</Text>
    <TouchableOpacity style={styles.button} onPress={handleCreateGym}>
      <Text style={styles.buttonText}>Criar Ginásio</Text>
    </TouchableOpacity>
  </View>
) : (
  <ScrollView>
    <Text style={styles.title}>Selecione um Ginásio</Text>
      <ScrollView>
        {gyms.map((gym) => (
          <TouchableOpacity key={gym.id} style={styles.gymCard} onPress={() => handleGymSelection(gym)}>
            <Text style={styles.gymName}>{gym.name}</Text>
            <Text style={styles.gymLocation}>{gym.location}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        transparent={true}
        visible={isPasswordModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Password para entrar no(a): {selectedGym?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={gymPassword}
              onChangeText={setGymPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setIsPasswordModalVisible(false)}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  </ScrollView>
)}

      <Modal
        transparent={true}
        visible={isCreatingGym} 
        animationType="slide"
        onRequestClose={() => setIsCreatingGym(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsCreatingGym(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>Criação do Ginásio</Text>
            
            <ScrollView style={styles.scrollView}>
              <TextInput
                style={styles.input}
                placeholder="Nome do Ginásio"
                value={newGymName}
                onChangeText={setNewGymName}
              />
              <TextInput
                style={styles.input}
                placeholder="Localização"
                value={newGymLocation}
                onChangeText={setNewGymLocation}
              />

              <Text style={styles.modalText}>Dias de Operação</Text>
              <View style={styles.daysContainer}>
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
                  <TouchableOpacity 
                    key={day} 
                    style={[styles.dayButton, daysOfOperation.includes(day) && styles.selectedDay]}
                    onPress={() => toggleDayOfOperation(day)}
                  >
                    <Text style={styles.buttonText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalText}>Horário de Operação</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={openHour} style={styles.picker} onValueChange={setOpenHour}>
                  {[...Array(24).keys()].map((hour) => (
                    <Picker.Item key={hour} label={`${hour < 10 ? '0' : ''}${hour}`} value={`${hour < 10 ? '0' : ''}${hour}`} />
                  ))}
                </Picker>
                <Picker selectedValue={openMinute} style={styles.picker} onValueChange={setOpenMinute}>
                  {[...Array(60).keys()].map((minute) => (
                    <Picker.Item key={minute} label={`${minute < 10 ? '0' : ''}${minute}`} value={`${minute < 10 ? '0' : ''}${minute}`} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Picker selectedValue={closeHour} style={styles.picker} onValueChange={setCloseHour}>
                  {[...Array(24).keys()].map((hour) => (
                    <Picker.Item key={hour} label={`${hour < 10 ? '0' : ''}${hour}`} value={`${hour < 10 ? '0' : ''}${hour}`} />
                  ))}
                </Picker>
                <Picker selectedValue={closeMinute} style={styles.picker} onValueChange={setCloseMinute}>
                  {[...Array(60).keys()].map((minute) => (
                    <Picker.Item key={minute} label={`${minute < 10 ? '0' : ''}${minute}`} value={`${minute < 10 ? '0' : ''}${minute}`} />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Password do Ginásio"
                secureTextEntry
                value={gymPassword}
                onChangeText={setGymPassword}
              />

              <TouchableOpacity style={styles.button} onPress={handleContinueToAdminCreation}>
                <Text style={styles.buttonText}>Continuar para Criar Utilizador</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isCreatingAdmin} 
        animationType="slide"
        onRequestClose={() => setIsCreatingAdmin(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsCreatingAdmin(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>Crie o seu Utilizador</Text>
            
            {/* Envolva o conteúdo com ScrollView */}
            <ScrollView style={styles.scrollView}>
              <TextInput
                style={styles.input}
                placeholder="Nome do Utilizador"
                value={adminName}
                onChangeText={setAdminName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={adminEmail}
                onChangeText={setAdminEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={adminPassword}
                onChangeText={setAdminPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleCreateAdminUser}>
                <Text style={styles.buttonText}>Criar Utilizador Admin</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff0000',
    padding: 5,
    borderRadius: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '45%',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  selectedDay: {
    backgroundColor: '#4CAF50', 
  },
  scrollView: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  noGymsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  gymCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  gymLocation: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  titleContainer: {
    alignItems: 'center', 
    marginVertical: 20, 
  },
  clickableTitleButton: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
  },
  clickableTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop:5,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  
  
});

export default GinasiosPage;
