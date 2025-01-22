import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TreinosUtilizadorPage = () => {
  const [userId, setUserId] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

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
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Domingo
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado

        const treinosDaSemana = allTreinos.filter(treino => {
          const treinoDate = new Date(treino.data);
          return treinoDate >= startOfWeek && treinoDate <= endOfWeek;
        });

        setTreinos(treinosDaSemana);
      } catch (error) {
        console.error('Erro ao buscar treinos:', error);
      }
    };

    fetchTreinos();
  }, [userId]);

  const handleModalOpen = treino => {
    setSelectedTreino(treino);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTreino(null);
  };

  const handleRequestModalOpen = () => {
    setRequestModalVisible(true);
  };

  const handleRequestModalClose = () => {
    setRequestModalVisible(false);
  };

  const renderTimeline = () => {
    const startHour = 6;
    const endHour = 23;
    const minutesInterval = 15;
    const timeSlots = [];
  
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += minutesInterval) {
        timeSlots.push({ hour, minutes });
      }
    }
  
    return timeSlots.map((slot, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.hourText}>
          {String(slot.hour).padStart(2, '0')}:{String(slot.minutes).padStart(2, '0')}
        </Text>
        {days.map((day, dayIndex) => {
          const treinosDoDia = treinos.filter(treino => {
            const treinoDate = new Date(treino.data);
            return treinoDate.getDay() === (dayIndex + 1) % 7;
          });
  
          return (
            <View key={day} style={styles.cell}>
              {treinosDoDia.map(treino => {
                const treinoHora = new Date(treino.hora);
                const treinoStartMinutes = treinoHora.getHours() * 60 + treinoHora.getMinutes();
                const slotStartMinutes = slot.hour * 60 + slot.minutes;
                const slotEndMinutes = slotStartMinutes + minutesInterval;
  
                if (treinoStartMinutes >= slotStartMinutes && treinoStartMinutes < slotEndMinutes) {
                  const treinoStyle = treino.aceito
                    ? styles.treinoAceito
                    : styles.treinoPendente;
  
                  return (
                    <TouchableOpacity
                      key={treino.id}
                      style={[styles.treinoAbsolute, treinoStyle]}
                      onPress={() => handleModalOpen(treino)}
                    >
                      <Text style={styles.treinoText}>
                        {treino.exercicios.length} Exercícios
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              })}
            </View>
          );
        })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {days.map(day => (
          <Text key={day} style={styles.dayHeader}>
            {day}
          </Text>
        ))}
      </View>
      <ScrollView>{renderTimeline()}</ScrollView>

      <Modal
  visible={requestModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={handleRequestModalClose}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Pedir Agendamento</Text>

      {/* Seletor de Data */}
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

      {/* Seletor de Hora */}
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

      {/* Renderiza o picker conforme o modo */}
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
              });
              alert('Pedido de agendamento enviado com sucesso!');
              handleRequestModalClose();
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
        onPress={handleRequestModalClose}
        style={styles.modalButton}
      >
        <Text style={styles.modalButtonText}>Fechar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      <TouchableOpacity
        style={styles.requestButton}
        onPress={handleRequestModalOpen}
      >
        <Text style={styles.requestButtonText}>Pedir Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dayHeader: {
    width: width / 7,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    minHeight: 70,
  },
  hourText: {
    width: 50,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
  },
  cell: {
    width: width / 7,
    height: 70,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  treinoAbsolute: {
    position: 'absolute',
    width: '90%',
    backgroundColor: '#D4EDDA',
    borderColor: '#28A745',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    zIndex: 1,
  },
  treinoText: {
    color: '#28A745',
    fontSize: 14,
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
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  exerciseList: {
    marginVertical: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#555',
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
  treinoAceito: {
    backgroundColor: '#D4EDDA',
    borderColor: '#28A745',
  },
  treinoPendente: {
    backgroundColor: '#FFE4B5', 
    borderColor: '#FFA500',    
  },
});

export default TreinosUtilizadorPage;
