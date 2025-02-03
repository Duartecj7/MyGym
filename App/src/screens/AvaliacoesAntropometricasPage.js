import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LineChart } from 'react-native-chart-kit';

const AvaliacoesAntropometricasPage = ({ route, navigation }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [arm, setArm] = useState('');
  const [thigh, setThigh] = useState('');
  const [notes, setNotes] = useState('');
  const [evaluations, setEvaluations] = useState([]);

  const handleSaveEvaluation = async () => {
    if (!weight || !height) {
      Alert.alert('Erro', 'Peso e altura são obrigatórios.');
      return;
    }

    try {
      const clientId = route.params.clientId;
      const evaluation = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        waist: parseFloat(waist) || null,
        hip: parseFloat(hip) || null,
        arm: parseFloat(arm) || null,
        thigh: parseFloat(thigh) || null,
        notes: notes || '',
        date: new Date().toISOString(),
      };

      await firestore()
        .collection('clientes')
        .doc(clientId)
        .collection('avaliacoesAntropometricas')
        .add(evaluation);

      Alert.alert('Sucesso', 'Avaliação guardada com sucesso!');
      fetchEvaluations(); 
      setWeight('');
      setHeight('');
      setWaist('');
      setHip('');
      setArm('');
      setThigh('');
      setNotes('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao guardar a avaliação. Tente novamente.');
    }
  };

  const fetchEvaluations = async () => {
    try {
      const clientId = route.params.clientId;
      const snapshot = await firestore()
        .collection('clientes')
        .doc(clientId)
        .collection('avaliacoesAntropometricas')
        .orderBy('date', 'asc')
        .get();

      const evaluationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const createChartData = (label, dataKey) => ({
    labels: evaluations.map(e => new Date(e.date).toLocaleDateString('pt-PT')),
    datasets: [
      {
        data: evaluations.map(e => e[dataKey] || 0),
        color: (opacity = 1) => `rgba(${label === 'Cintura' ? '255, 99, 132' : label === 'Quadril' ? '54, 162, 235' : label === 'Braço' ? '255, 206, 86' : label === 'Coxa' ? '75, 192, 192' : '0, 0, 0'}, ${opacity})`,
        strokeWidth: 2,
        label: `${label} (cm)`,
      },
    ],
    legend: [`${label} (cm)`],
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Avaliações Antropométricas</Text>
      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Circunferência da Cintura (cm)"
        keyboardType="numeric"
        value={waist}
        onChangeText={setWaist}
      />
      <TextInput
        style={styles.input}
        placeholder="Circunferência do Quadril (cm)"
        keyboardType="numeric"
        value={hip}
        onChangeText={setHip}
      />
      <TextInput
        style={styles.input}
        placeholder="Circunferência do Braço (cm)"
        keyboardType="numeric"
        value={arm}
        onChangeText={setArm}
      />
      <TextInput
        style={styles.input}
        placeholder="Circunferência da Coxa (cm)"
        keyboardType="numeric"
        value={thigh}
        onChangeText={setThigh}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Notas adicionais"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveEvaluation}>
        <Text style={styles.buttonText}>Guardar Avaliação</Text>
      </TouchableOpacity>

      <View >
        <Text/>
        <Text style={styles.chartTitle}> Progresso das Avaliações</Text>
      </View>
      {evaluations.length > 0 && (
        <View>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Peso</Text>
            <LineChart
              data={createChartData('Peso', 'weight')}
              width={Dimensions.get('window').width - 32}
              height={300}
              yAxisSuffix="kg"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000', 
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Cintura</Text>
            <LineChart
              data={createChartData('Cintura', 'waist')}
              width={Dimensions.get('window').width - 32} 
              height={300}
              yAxisSuffix="cm"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000', 
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Quadril</Text>
            <LineChart
              data={createChartData('Quadril', 'hip')}
              width={Dimensions.get('window').width - 32} 
              height={300}
              yAxisSuffix="cm"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000', 
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Braço</Text>
            <LineChart
              data={createChartData('Braço', 'arm')}
              width={Dimensions.get('window').width - 32} 
              height={300}
              yAxisSuffix="cm"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000', 
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Coxa</Text>
            <LineChart
              data={createChartData('Coxa', 'thigh')}
              width={Dimensions.get('window').width - 32}
              height={300}
              yAxisSuffix="cm"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000', 
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      )}
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
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default AvaliacoesAntropometricasPage;
