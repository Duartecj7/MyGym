import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const ModalidadesTreinadorPage = ({ route }) => {
  const { gymId } = route.params; // Pegando o ID do ginásio vindo da navegação
  const [modalidades, setModalidades] = useState([]);
  const [novaModalidade, setNovaModalidade] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhesModalVisible, setDetalhesModalVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [detalhesModalidade, setDetalhesModalidade] = useState(null);
  const [treinadores, setTreinadores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedTreinador, setSelectedTreinador] = useState('');
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);

  useEffect(() => {
    fetchModalidades();
    fetchTreinadores();
    fetchUsuarios();
  }, []);

  // Buscar as modalidades do ginásio
  const fetchModalidades = async () => {
    try {
      const snapshot = await firestore()
        .collection('ginasios')
        .doc(gymId)
        .collection('modalidades')
        .get();

      const modalidadesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setModalidades(modalidadesList);
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
    }
  };

  // Buscar treinadores
  const fetchTreinadores = async () => {
    try {
      const snapshot = await firestore()
        .collection('ginasios')
        .doc(gymId)
        .collection('utilizadores')
        .where('role', '==', 'treinadorModalidade') // Filtrando apenas treinadores
        .get();

      const treinadoresList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTreinadores(treinadoresList);
    } catch (error) {
      console.error('Erro ao buscar treinadores:', error);
    }
  };

  // Buscar utilizadores
  const fetchUsuarios = async () => {
    try {
      const snapshot = await firestore()
        .collection('ginasios')
        .doc(gymId)
        .collection('utilizadores')
        .where('role', '==', 'cliente') // Filtro para pegar apenas clientes
        .get();
  
      const usuariosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setUsuarios(usuariosList);
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
    }
  };

  // Criar nova modalidade
  const criarModalidade = async () => {
    if (!novaModalidade.trim()) {
      Alert.alert('Erro', 'O nome da modalidade não pode estar vazio.');
      return;
    }

    try {
      await firestore()
        .collection('ginasios')
        .doc(gymId)
        .collection('modalidades')
        .add({ nome: novaModalidade });

      Alert.alert('Sucesso', 'Modalidade adicionada com sucesso!');
      setNovaModalidade('');
      setModalVisible(false);
      fetchModalidades(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao criar modalidade:', error);
    }
  };

  // Abrir detalhes da modalidade
  const openModalidadeDetails = (modalidade) => {
    setDetalhesModalidade(modalidade);
    setDetalhesModalVisible(true);
  };

  // Configurar os detalhes da modalidade
  const configurarDetalhesModalidade = async () => {
    try {
      await firestore()
        .collection('ginasios')
        .doc(gymId)
        .collection('modalidades')
        .doc(detalhesModalidade.id)
        .update({
          treinador: selectedTreinador,
          utilizadores: selectedUsuarios,
        });

      Alert.alert('Sucesso', 'Detalhes da modalidade atualizados!');
      setConfigModalVisible(false);
      setDetalhesModalVisible(false);
      fetchModalidades(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao configurar modalidade:', error);
    }
  };

  const toggleUsuarioSelection = (usuarioId) => {
    setSelectedUsuarios((prevSelected) =>
      prevSelected.includes(usuarioId)
        ? prevSelected.filter((id) => id !== usuarioId) // Desmarcar
        : [...prevSelected, usuarioId] // Marcar
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modalidades do Ginásio</Text>

      {/* Lista de modalidades */}
      <FlatList
        data={modalidades}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openModalidadeDetails(item)}>
            <Text style={styles.itemText}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Botão para adicionar nova modalidade */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Criar Modalidade</Text>
      </TouchableOpacity>

      {/* Modal para adicionar nova modalidade */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Modalidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da modalidade"
              value={novaModalidade}
              onChangeText={setNovaModalidade}
            />
            <TouchableOpacity style={styles.modalButton} onPress={criarModalidade}>
              <Text style={styles.modalButtonText}>Criar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para exibir detalhes da modalidade */}
      <Modal visible={detalhesModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {detalhesModalidade && (
              <>
                <Text style={styles.modalTitle}>{detalhesModalidade.nome}</Text>
                {detalhesModalidade.treinador ? (
                  <Text style={styles.itemText}>Treinador: {detalhesModalidade.treinador}</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setConfigModalVisible(true)}
                  >
                    <Text style={styles.modalButtonText}>Configurar os detalhes da modalidade</Text>
                  </TouchableOpacity>
                )}
                {detalhesModalidade.utilizadores && detalhesModalidade.utilizadores.length > 0 ? (
                  <Text style={styles.itemText}>
                    Utilizadores: {detalhesModalidade.utilizadores.join(', ')}
                  </Text>
                ) : null}
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setDetalhesModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para configurar os detalhes da modalidade */}
      <Modal visible={configModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Detalhes da Modalidade</Text>

            {/* Combobox para selecionar o treinador */}
            <Picker
              selectedValue={selectedTreinador}
              style={styles.input}
              onValueChange={(itemValue) => setSelectedTreinador(itemValue)}
            >
              <Picker.Item label="Selecione o Treinador" value="" />
              {treinadores.map((treinador) => (
                <Picker.Item key={treinador.id} label={treinador.nome} value={treinador.id} />
              ))}
            </Picker>

            {/* Verificação de clientes disponíveis */}
            {usuarios.length === 0 ? (
              <Text style={styles.noClientsText}>Não há clientes para formar uma turma</Text>
            ) : (
              <>
                {/* ScrollView horizontal de utilizadores */}
                <Text>Escolha a turma:</Text>
                <ScrollView horizontal style={styles.usersContainer}>
                  {usuarios.map((usuario) => (
                    <TouchableOpacity
                      key={usuario.id}
                      style={[
                        styles.usuarioItem,
                        selectedUsuarios.includes(usuario.id) && styles.selectedUser,
                      ]}
                      onPress={() => toggleUsuarioSelection(usuario.id)}
                    >
                      <Text style={styles.usuarioText}>{usuario.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Botão de salvar visível apenas se houver clientes selecionados */}
            {selectedUsuarios.length > 0 && (
              <TouchableOpacity style={styles.modalButton} onPress={configurarDetalhesModalidade}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setConfigModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ModalidadesTreinadorPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#28A745',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#d9534f',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  usersContainer: {
    width: '100%',
    marginVertical: 10,
  },
  usuarioItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    elevation: 3,
  },
  selectedUser: {
    backgroundColor: '#28A745',
  },
  usuarioText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noClientsText: {
    fontSize: 16,
    color: '#d9534f',
    marginVertical: 10,
  },
});
