import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Button } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import InputSpinner from "react-native-input-spinner";
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const CriarTreinoPage = ({ route, navigation }) => {
  const [exercicios, setExercicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedExercicios, setSelectedExercicios] = useState([]);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [exercicioDetalhes, setExercicioDetalhes] = useState({});
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const { gymId } = route.params; 

  useEffect(() => {
    firestore()
      .collection('ginasios')
      .doc(gymId)
      .collection('exercicios')
      .get()
      .then(snapshot => {
        const exerciciosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercicios(exerciciosList);
      })
      .catch(error => {
        console.error('Erro a procurar os exercícios:', error);
      });

    firestore().collection('ginasios')
    .doc(gymId).collection('utilizadores').get()
      .then(snapshot => {
        const usuariosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const clientes = usuariosList.filter(usuario => usuario.role === 'cliente');
        setUsuarios(clientes);
      })
      .catch(error => {
        console.error('Erro a procurar os utilizadores:', error);
      });
  }, [gymId]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const handleSelectUsuario = (usuarioId) => {
    setSelectedUsuarios(prevState =>
      prevState.includes(usuarioId)
        ? prevState.filter(id => id !== usuarioId)
        : [...prevState, usuarioId]
    );
  };

  const handleSelectExercicio = (exercicioId) => {
    setSelectedExercicios(prevState =>
      prevState.includes(exercicioId)
        ? prevState.filter(id => id !== exercicioId)
        : [...prevState, exercicioId]
    );

    setExercicioDetalhes(prevState => {
      if (prevState[exercicioId]) {
        const { [exercicioId]: _, ...rest } = prevState;
        return rest;
      } else {
        return {
          ...prevState,
          [exercicioId]: { repeticoes: 1, series: 1, tempo: 1 },
        };
      }
    });
  };

  const handleInputChange = (exercicioId, field, value) => {
    setExercicioDetalhes(prevState => ({
      ...prevState,
      [exercicioId]: {
        ...prevState[exercicioId],
        [field]: value,
      },
    }));
  };

  const handleCreateTreino = () => {
    if (selectedExercicios.length === 0 || selectedUsuarios.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos um exercício e um utilizador.');
      return;
    }

    const treinadorId = auth().currentUser.uid;

    const treino = {
      exercicios: selectedExercicios.map(id => ({
        id,
        ...exercicioDetalhes[id],
      })),
      usuarios: selectedUsuarios,
      data: date.toISOString(),
      hora: time.toISOString(),
      treinadorId: treinadorId, 
    };

    firestore()
      .collection('ginasios')
      .doc(gymId)
      .collection('treinos')
      .add(treino)
      .then(() => {
        Alert.alert('Sucesso', 'Treino criado com sucesso!');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Erro ao criar treino:', error);
        Alert.alert('Erro', 'Não foi possível criar o treino.');
      });
  };

  const renderExercicioItem = ({ item }) => {
    const isSelected = selectedExercicios.includes(item.id);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.row}>
          <CheckBox
            value={isSelected}
            onValueChange={() => handleSelectExercicio(item.id)}
          />
          <Text style={styles.checkboxText}>{item.nome}</Text>
        </View>

        {isSelected && (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Repetições:</Text>
            <InputSpinner
              min={1}
              step={1}
              value={exercicioDetalhes[item.id]?.repeticoes || 1}
              onChange={(value) => handleInputChange(item.id, 'repeticoes', value)}
              buttonStyle={styles.spinnerButton}
              buttonTextStyle={styles.spinnerButtonText}
            />

            <Text style={styles.label}>Séries:</Text>
            <InputSpinner
              min={1}
              step={1}
              value={exercicioDetalhes[item.id]?.series || 1}
              onChange={(value) => handleInputChange(item.id, 'series', value)}
              buttonStyle={styles.spinnerButton}
              buttonTextStyle={styles.spinnerButtonText}
            />

            <Text style={styles.label}>Tempo (min):</Text>
            <InputSpinner
              min={1}
              step={1}
              value={exercicioDetalhes[item.id]?.tempo || 1}
              onChange={(value) => handleInputChange(item.id, 'tempo', value)}
              buttonStyle={styles.spinnerButton}
              buttonTextStyle={styles.spinnerButtonText}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.subTitle}>Data: {date.toLocaleDateString('pt-PT')} | Hora: {time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      <View style={styles.splitContainer}>
        <View style={styles.halfContainer}>
          <Text style={styles.subTitle}>Selecione os Exercícios</Text>
          <FlatList
            data={exercicios}
            keyExtractor={(item) => item.id}
            renderItem={renderExercicioItem}
          />
        </View>

        <View style={styles.halfContainer}>
          <Text style={styles.subTitle}>Selecione os Utilizadores</Text>
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <CheckBox
                  value={selectedUsuarios.includes(item.id)}
                  onValueChange={() => handleSelectUsuario(item.id)}
                />
                <Text>{item.email}</Text>
              </View>
            )}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Button title="Selecione a Hora" onPress={() => setShowTimePicker(true)} color="#007BFF" />
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <Button title="Selecione a Data" onPress={() => setShowDatePicker(true)} color="#007BFF" />
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <Button
          title="Criar Treino"
          onPress={handleCreateTreino}
          color="#007BFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfContainer: {
    flex: 0.5,
    paddingHorizontal: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
  },
  formContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
  },
  spinnerButton: {
    width: 25,
  },
  spinnerButtonText: {
    fontSize: 40,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateTimeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default CriarTreinoPage;
