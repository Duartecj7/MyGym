import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const AdicionarExercicioPage = ({ route, navigation }) => {
  const [nome, setNome] = useState('');
  const [maquina, setMaquina] = useState('');
  const [musculos, setMusculos] = useState('');
  
  const muscleGroups = [
    'peito',
    'ombro',
    'rabo',
    'perna',
    'perna trás',
    'bíceps',
    'tríceps',
    'gêmeo',
    'abs',
    'costas',
  ];

  const handleAddExercise = async () => {
    if (!nome || !musculos) {
      Alert.alert('Erro', 'Os campos Nome e Músculos são obrigatórios.');
      return;
    }

    try {
      const novoExercicio = {
        nome,
        maquina: maquina || null,
        musculos,
      };

      await firestore()
        .collection('exercicios')
        .add(novoExercicio);

      Alert.alert('Sucesso', 'Exercício adicionado com sucesso!');
      navigation.goBack(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível adicionar o exercício. Tente novamente.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Adicionar Exercício</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Exercício"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Máquina (opcional)"
        value={maquina}
        onChangeText={setMaquina}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Grupo Muscular</Text>
        <Picker
          selectedValue={musculos}
          onValueChange={(itemValue) => setMusculos(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um grupo muscular" value="" />
          {muscleGroups.map((muscle, index) => (
            <Picker.Item key={index} label={muscle} value={muscle} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddExercise}>
        <Text style={styles.buttonText}>Guardar Exercício</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdicionarExercicioPage;
