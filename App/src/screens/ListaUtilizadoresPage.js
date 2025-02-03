import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, Button } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ListaUtilizadoresPage = ({ navigation, route }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [newRole, setNewRole] = useState('cliente');
  const [alterRoleEnabled, setAlterRoleEnabled] = useState(false);
  const { gymId } = route.params;

  const checkIfAdmin = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const gymDoc = await firestore().collection('ginasios').doc(gymId).get();
      if (!gymDoc.exists) {
        Alert.alert('Erro', 'Ginásio não encontrado!');
        navigation.goBack();
        return;
      }

      const userSnapshot = await gymDoc.ref.collection('utilizadores').where('email', '==', user.email).get();
      if (!userSnapshot.empty && userSnapshot.docs[0].data().role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        Alert.alert('Acesso negado', 'Não tem permissão para entrar na página pedida.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao verificar o papel do utilizador', error);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const gymDoc = await firestore().collection('ginasios').doc(gymId).get();
      if (!gymDoc.exists) {
        Alert.alert('Erro', 'Ginásio não encontrado!');
        return;
      }
      const snapshot = await gymDoc.ref.collection('utilizadores').get();
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro a procurar os clientes', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchClientes();
    }
  }, [isAdmin]);

  const openModal = (cliente) => {
    setSelectedCliente(cliente);
    setNewRole(cliente.role);
    setAlterRoleEnabled(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCliente(null);
    setAlterRoleEnabled(false);
  };

  const handleDesativar = async () => {
    try {
      await firestore().collection('ginasios').doc(gymId).collection('utilizadores').doc(selectedCliente.id).update({
        ativo: false,
      });
      Alert.alert('Sucesso', 'Cliente desativado com sucesso!');
      closeModal();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao desativar cliente', error);
      Alert.alert('Erro', 'Não foi possível desativar o cliente.');
    }
  };

  const handleAlterarPermissoes = async () => {
    try {
      await firestore().collection('ginasios').doc(gymId).collection('utilizadores').doc(selectedCliente.id).update({
        role: newRole,
      });
      Alert.alert('Alteração de Permissões', 'Permissões alteradas com sucesso!');
      closeModal();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao alterar permissões do cliente', error);
      Alert.alert('Erro', 'Não foi possível alterar as permissões.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.clientContainer}>
      <View style={styles.clientInfoContainer}>
        <Text style={styles.clientText}>Nome: {item.nome}</Text>
        <Text style={styles.clientText}>Email: {item.email}</Text>
      </View>
      <Text style={styles.roleText}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.title}>Lista de Utilizadores</Text>
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </>
      )}

      {/* Modal de informações do cliente */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedCliente && (
              <>
                <Text style={styles.modalTitle}>Informações do Cliente</Text>
                <Text style={styles.modalText}>Nome: {selectedCliente.nome}</Text>
                <Text style={styles.modalText}>Email: {selectedCliente.email}</Text>
                <Text style={styles.modalText}>Estado: {selectedCliente.ativo ? 'Ativo' : 'Desativado'}</Text>
                <Text style={styles.modalText}>Role: {selectedCliente.role.charAt(0).toUpperCase() + selectedCliente.role.slice(1)}</Text>

                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={alterRoleEnabled}
                    onValueChange={(newValue) => setAlterRoleEnabled(newValue)}
                  />
                  <Text style={styles.checkboxText}>Alterar papel do utilizador</Text>
                </View>

                {alterRoleEnabled && (
                  <>
                    <Picker
                      selectedValue={newRole}
                      style={styles.picker}
                      onValueChange={(itemValue) => setNewRole(itemValue)}
                    >
                      <Picker.Item label="Cliente" value="cliente" />
                      <Picker.Item label="Administrador" value="admin" />
                      <Picker.Item label="Treinador de modalidade" value="treinadorModalidade" />
                    </Picker>
                  </>
                )}

                {/* Botões centralizados e em linha única */}
                <View style={styles.buttonContainer}>
                  <View style={styles.buttonRow}>
                    <Button title="Desativar Cliente" onPress={handleDesativar} />
                  </View>
                  <View style={styles.buttonRow}>
                    <Button title="Guardar Alterações" onPress={handleAlterarPermissoes} />
                  </View>
                  <View style={styles.buttonRow}>
                    <Button title="Fechar" onPress={closeModal} />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  clientContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfoContainer: {
    flex: 1,
  },
  clientText: {
    fontSize: 18,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 350,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    width: 220,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxText: {
    fontSize: 18,
    marginLeft: 10,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 15,
  },
  buttonRow: {
    marginBottom: 10,
    width: '100%',
  },
});

export default ListaUtilizadoresPage;
