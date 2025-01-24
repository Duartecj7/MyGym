import React, { useEffect, useState } from 'react';
import {  View,  Text,  StyleSheet,  TouchableOpacity,  ScrollView,  Modal} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TreinosUtilizadorPage = () => {
  const [userId, setUserId] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTreinos();
      fetchAgendamentos();
    }
  }, [userId]);

  const fetchTreinos = async () => {
    try {
      const snapshot = await firestore()
        .collection('treinos')
        .where('usuarios', 'array-contains', userId)
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
      const snapshot = await firestore().collection('agendamentos').get();

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
          agendamento.aceito === false
        );
      });

      setAgendamentos(agendamentosDaSemana);

    } catch (error) {
      console.error('Erro ao procurar os agendamentos:', error);
    }
  };
  const handleModalOpen = (item) => {
    if (item.type === 'treino') {
      setSelectedTreino(item);  
      setSelectedAgendamento(null); 
    } else {
      setSelectedAgendamento(item);  
      setSelectedTreino(null);  
    }
};
  
const renderSchedule = (day) => {
  const dayTreinos = treinos.filter(treino => new Date(treino.data).getDay() === day);
  const dayAgendamentos = agendamentos.filter(agendamento => new Date(agendamento.data).getDay() === day);

  const combinedList = [
    ...dayTreinos.map(treino => ({ ...treino, type: 'treino' })),
    ...dayAgendamentos.map(agendamento => ({ ...agendamento, type: 'agendamento' })),
  ];

  const sortedList = combinedList.sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <View style={styles.column}>
      <Text style={styles.dayLabel}>{days[day]}</Text>
      {sortedList.map(item => (
        <TouchableOpacity
          key={`${item.type}-${item.id}`}
          style={[
            styles.card,
            {
              backgroundColor:
                item.type === 'treino'
                  ? '#4caf50' 
                  : item.Estado === 'Agendamento Recusado'
                  ? '#f44336' 
                  : '#ff9800', 
            },
          ]}
          onPress={() => {
            if (item.type === 'treino') {
              handleModalOpen(item);
            } else {
              handleModalOpen(item);
            }
          }}
        >
          <Text style={styles.cardText}>
            {item.type === 'treino' ? 'Treino' : 'Agendamento'}
          </Text>
          <Text style={styles.cardText}>
            {new Date(item.data).toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <ScrollView horizontal contentContainerStyle={styles.scheduleContainer}>
          {Array.from({ length: 7 }, (_, index) => (
            <View key={`day-${index}`}>
              {renderSchedule(index)}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal para Pedir Agendamento */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pedir Agendamento</Text>

            <TouchableOpacity
              onPress={() => setShowTimePicker({ mode: 'date' })}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>
                {selectedTime
                  ? `Data: ${new Date(selectedTime).toLocaleDateString()}`
                  : 'Selecionar Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker({ mode: 'time' })}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>
                {selectedTime
                  ? `Hora: ${new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Selecionar Hora'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode={showTimePicker.mode}
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    const updatedTime = new Date(selectedTime || Date.now());
                    if (showTimePicker.mode === 'date') {
                      updatedTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    } else if (showTimePicker.mode === 'time') {
                      updatedTime.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                    }
                    setSelectedTime(updatedTime.toISOString());
                  }
                }}
              />
            )}
             
            <TouchableOpacity
              onPress={async () => {
                if (selectedTime) {
                  try {
                    await firestore().collection('agendamentos').add({
                      userId: userId,
                      data: selectedTime,
                      aceito: false,
                      criadoEm: firestore.FieldValue.serverTimestamp(),
                      Estado: "Aguarda aprovação",
                    });
                    alert('Pedido de agendamento enviado com sucesso!');
                    setRequestModalVisible(false);
                  } catch (error) {
                    console.error('Erro ao guardar o pedido de agendamento:', error);
                    alert('Erro ao enviar pedido de agendamento. Tente novamente.');
                  }
                } else {
                  alert('Por favor, selecione uma data e hora antes de guardar.');
                }
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRequestModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedTreino}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTreino(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes do Treino</Text>
            <Text>Treino ID: {selectedTreino?.id}</Text>
            <Text>Data: {new Date(selectedTreino?.data).toLocaleDateString()}</Text>
            <TouchableOpacity
              onPress={() => setSelectedTreino(null)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedAgendamento}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedAgendamento(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes do Agendamento</Text>
            <Text>Estado: {selectedAgendamento?.Estado}</Text>
            <Text>Data: {new Date(selectedAgendamento?.data).toLocaleDateString()}</Text>
            <Text>Hora: {new Date(selectedAgendamento?.data).toLocaleTimeString()}</Text>
            <Text>Pedido feito no dia: {new Date(selectedAgendamento?.criadoEm.seconds*1000).toLocaleDateString("pt-PT")}</Text>
            <TouchableOpacity
              onPress={() => setSelectedAgendamento(null)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => setRequestModalVisible(true)}
      >
        <Text style={styles.requestButtonText}>Pedir Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: 120,
    padding: 5,
  },
  dayLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  requestButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#28A745',
  },
  modalButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default TreinosUtilizadorPage;
