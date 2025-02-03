import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import InputSpinner from "react-native-input-spinner";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CheckBox from '@react-native-community/checkbox';

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TreinosTreinadorPage = ({route}) => {
  const [treinadorId, setTreinadorId] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [utilizadores, setUtilizadores]=useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false); 
  const [selectedUsers, setSelectedUsers] = useState({});
  const [selectedExercises, setSelectedExercises] = useState({});
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [ShowExerciseConfig,setShowExerciseConfig] = useState(null);
  const { gymId } = route.params;

  const [exerciseConfig, setExerciseConfig] = useState({
    series: 1,
    repeticoes: 1,
    tempo: 1,
  });
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setTreinadorId(currentUser.uid);
    }
    fetchTreinos();
    fetchAgendamentos();
    fetchUtilizadores();
    fetchExercicios();
    

  }, [treinadorId]);  

  const fetchUtilizadores = async () => {
    try {
      const snapshot = await firestore().collection('ginasios').doc(gymId).collection('utilizadores').get();
      
      const usuariosData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          email: doc.data().email, 
          roles: doc.data().roles,
          ativo: doc.data().ativo,
          ...doc.data(),
        }))
        .filter(user => user.role === 'cliente' && user.ativo === true); 
  
      setUtilizadores(usuariosData);
    } catch (error) {
      console.error('Erro ao buscar os clientes:', error);
    }
  };
  

  const fetchTreinos = async () => {
    try {
      const snapshot = await firestore().collection('ginasios').doc(gymId)
        .collection('treinos')
        .where('treinadorId', '==', treinadorId)
        .get();

      const allTreinos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const treinosDaSemana = allTreinos.filter(treino => {
        const treinoDate = new Date(treino.data);
        return treinoDate >= startOfWeek && treinoDate <= endOfWeek;
      });

      setTreinos(treinosDaSemana);
    } catch (error) {
      console.error('Erro a procurar os treinos:', error);
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const snapshot = await firestore().collection('ginasios').doc(gymId).collection('agendamentos').get();

      const allAgendamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const agendamentosDaSemana = allAgendamentos.filter(agendamento => {
        const agendamentoDate = new Date(agendamento.data);
        return (
          agendamentoDate >= startOfWeek &&
          agendamentoDate <= endOfWeek &&
          agendamento.aceito === false &&
          agendamento.Estado !== "Agendamento Recusado" 

        );
      });

      setAgendamentos(agendamentosDaSemana);

    } catch (error) {
      console.error('Erro ao procurar os agendamentos:', error);
    }
  };

  const fetchExercicios = async () =>{
    try{
        firestore().collection('ginasios').doc(gymId).collection('exercicios').get()
              .then(snapshot => {
                const exercicios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setExercicios(exercicios);
              })
             
        }catch (error) {
          console.error('Erro a procurar os treinos:', error);
        }
      
  }


  const handleFinalizarAgendamento = async () => {
    if (!selectedItem || !selectedExercises || !Object.keys(selectedExercises).length) {
      alert("Nenhum exercício foi selecionado. Por favor, configure os exercícios antes de finalizar.");
      return;
    }
  
    try {
      await firestore().collection('ginasios').doc(gymId)
        .collection('agendamentos')
        .doc(selectedItem.id)
        .update({
          aceito: true,
          Estado: "Agendamento Aceite!",
        });
  
      const novoTreino = {
        data: selectedItem.data, 
        hora: selectedItem.data, 
        treinadorId: treinadorId, 
        usuarios: [
          selectedItem.userId, 
          ...Object.keys(selectedUsers).filter(userId => selectedUsers[userId]), 
        ],
        exercicios: Object.keys(selectedExercises).map(exerciseId => ({
          id: exerciseId,
          ...exerciseConfig[exerciseId], 
        })),
      };
  
      await firestore().collection('ginasios').doc(gymId).collection('treinos').add(novoTreino);
  
      alert("Agendamento finalizado e treino criado com sucesso!");
      handleCloseModal(); 
    } catch (error) {
      console.error('Erro ao finalizar o agendamento e criar o treino:', error);
      alert("Erro ao finalizar o agendamento. Por favor, tente novamente.");
    }
  };
  
  
  
  const handleRecusarAgendamento = async () => {
    try {
      await firestore().collection('ginasios').doc(gymId)
        .collection('agendamentos')
        .doc(selectedItem.id)
        //.update({ aceito: false })
        .update({ Estado: "Agendamento Recusado"});
  
      console.log('Agendamento recusado com sucesso!');
      handleCloseModal(); 
    } catch (error) {
      console.error('Erro ao recusar o agendamento:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };
  
  const toggleExerciseSelection = (exerciseId) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleExerciseSelection = (exerciseId) => {
    toggleExerciseSelection(exerciseId);
    setSelectedExerciseId(exerciseId);
    setShowExerciseConfig(true); 
    setExerciseConfig({ series: 1, repeticoes: 1, tempo: 1 }); 
  };
  
  const handleOpenModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setModalVisible(true);
    setIsCheckboxChecked(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setModalType(null);
    setIsCheckboxChecked(false); 
  };

  const renderSchedule = (day) => {
    const dayTreinos = treinos.filter(treino => new Date(treino.data).getDay() === day);
    const dayAgendamentos = agendamentos.filter(agendamento => new Date(agendamento.data).getDay() === day);
  
    const combinedList = [
      ...dayTreinos.map(treino => ({ ...treino, type: 'treino' })), 
      ...dayAgendamentos.map(agendamento => ({ ...agendamento, type: 'agendamento' })),
    ];
  
    const sortedList = combinedList.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
    return (
      <View style={styles.column}>
  <Text style={styles.dayLabel}>{days[day]}</Text>
  <FlatList
    data={sortedList}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: item.type === 'treino' ? 'green' : 'orange' },
        ]}
        onPress={() => handleOpenModal(item, item.type)}
      >
        <Text>{new Date(item.data).toLocaleTimeString()}</Text>
      </TouchableOpacity>
    )}
  />
</View>

    );
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scheduleContainer}>
        <View style={styles.scheduleContainer}>
          {Array.from({ length: 7 }, (_, index) => renderSchedule(index))}
        </View>
      </ScrollView>
      <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={handleCloseModal}
      >
        <ScrollView>
          <View style={styles.modalContainer}>
            {modalType === 'treino' ? (
              <View>
                <Text style={styles.modalTitle}>Detalhes do Treino</Text>
                <Text style={[styles.dateTimeText, { fontWeight: 'bold', fontSize: 18 }]}>
                  Data: {new Date(selectedItem?.data).toLocaleDateString()}
                </Text>
                <Text style={[styles.dateTimeText, { fontWeight: 'bold', fontSize: 18 }]}>
                  Hora: {new Date(selectedItem?.hora).toLocaleTimeString()}
                </Text>

                <Text style={styles.modalSubtitle}>Exercícios:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedItem?.exercicios?.map((exercicio, index) => {
                    const exercicioDetalhes = exercicios.find(e => e.id === exercicio.id);
                    return (
                      <View key={exercicio.id || `exercicio-${index}`}
                      style={styles.horizontalCard}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16,  }}>
                          {exercicioDetalhes?.nome || 'Exercício Desconhecido'}
                        </Text>
                        <Text>Séries: {exercicio.series}</Text>
                        <Text>Repetições: {exercicio.repeticoes}</Text>
                        <Text>Tempo: {exercicio.tempo} min</Text>
                      </View>
                    );
                  })}
        </ScrollView>

          <Text style={styles.modalSubtitle}>Utilizadores:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedItem?.usuarios?.map(userId => {
            const user = utilizadores.find(user => user.id === userId);
            return (
              <View key={userId} style={styles.horizontalCard}>
                <Text>{user?.nome || 'Desconhecido'}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      ) : (
        <View>
          <Text style={styles.modalTitle}>Detalhes do Agendamento</Text>
          <Text>Pedido do cliente:{utilizadores.find(user => user.id === selectedItem?.userId)?.nome || 'Desconhecido'}</Text>
          <Text style={[styles.dateTimeText, { fontWeight: 'bold', fontSize: 18 }]}>
            Data: {new Date(selectedItem?.data).toLocaleString()}
          </Text>

          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isCheckboxChecked}
              onValueChange={setIsCheckboxChecked}
            />
            <Text>Deseja aceitar o agendamento pedido?</Text>
          </View>

          {isCheckboxChecked && (
            <>
              <View style={{ marginVertical: 20 }}>
                <Text style={styles.modalSubtitle}>Exercícios:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.exerciseListContainer}>
                    {exercicios.map((exercicio) => (
                      <TouchableOpacity
                        key={exercicio.id}
                        style={[
                          styles.exerciseCard,
                          selectedExercises[exercicio.id] && { backgroundColor: '#d3f9d8' },
                        ]}
                        onPress={() => handleExerciseSelection(exercicio.id)}
                      >
                        <Text style={styles.exerciseTitle}>{exercicio.nome}</Text>
                        {selectedExercises[exercicio.id] && (
                          <View style={styles.configContainer}>
                            <View style={styles.configRow}>
                              <Text>Séries:</Text>
                              <InputSpinner
                                max={10}
                                min={1}
                                step={1}
                                value={exerciseConfig[exercicio.id]?.series || 1}
                                onChange={(num) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    [exercicio.id]: { ...prev[exercicio.id], series: num },
                                  }))
                                }
                              />
                            </View>
                            <View style={styles.configRow}>
                              <Text>Repetições:</Text>
                              <InputSpinner
                                max={20}
                                min={1}
                                step={1}
                                value={exerciseConfig[exercicio.id]?.repeticoes || 1}
                                onChange={(num) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    [exercicio.id]: { ...prev[exercicio.id], repeticoes: num },
                                  }))
                                }
                              />
                            </View>
                            <View style={styles.configRow}>
                              <Text>Tempo (s):</Text>
                              <InputSpinner
                                max={300}
                                min={1}
                                step={1}
                                value={exerciseConfig[exercicio.id]?.tempo || 1}
                                onChange={(num) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    [exercicio.id]: { ...prev[exercicio.id], tempo: num },
                                  }))
                                }
                              />
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ marginVertical: 20 }}>
                <Text style={styles.modalSubtitle}>Utilizadores:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {utilizadores?.map(user => {
                    const isCreator = user.id === selectedItem?.userId;
                    return (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.horizontalCard,
                          (isCreator || selectedUsers[user.id]) && { backgroundColor: '#d3f9d8' },
                          isCreator && { opacity: 0.6 },
                        ]}
                        onPress={() => {
                          if (!isCreator) toggleUserSelection(user.id);
                        }}
                        disabled={isCreator}
                      >
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {isCreator ? `${user.email} (Criador)` : user.email}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        {modalType === 'agendamento' && isCheckboxChecked && (
          <TouchableOpacity
            onPress={handleFinalizarAgendamento}
            style={styles.finalizarButton}
          >
            <Text style={styles.buttonText}>Finalizar Agendamento</Text>
          </TouchableOpacity>
        )}

        {modalType === 'agendamento' && (
          <TouchableOpacity
            onPress={handleRecusarAgendamento}
            style={styles.recusarButton}
          >
            <Text style={styles.buttonText}>Recusar Agendamento</Text>
          </TouchableOpacity>
        )}

            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </Modal>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayHeader: {
    width: '14%',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    flexWrap: 'wrap', 
  },
  column: {
    flex:1,
    width: '14%',
    padding: 5,
    alignItems: "center"
  },
  dayColumn: {
    width: 200, 
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
     fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  exerciseCard: {
    width: 180, 
    height: 275, 
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15, 
    margin: 10, 
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseContent: {
    marginLeft: 10,
  },
  userText: {
    fontSize: 16,
    marginVertical: 3,
  },
  closeButton: {
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    width: '33%',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  acceptanceMessage: {
    marginTop: 10,
    fontWeight: 'bold',
    color: 'green',
  },
  listsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  listColumn: {
    width: '48%', 
  },
  itemText: {
    fontSize: 14,
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff', 
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  finalizarButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '33%',
    alignItems: 'center',
  },
  recusarButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '33%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  horizontalCard: {
    width: 150,
    height: 100,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation:3,
  },
  configContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
});

export default TreinosTreinadorPage;
