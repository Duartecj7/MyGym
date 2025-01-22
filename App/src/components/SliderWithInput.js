import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Slider } from 'react-native-awesome-slider';

const SliderWithInput = () => {
  const [value, setValue] = useState(50);

  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (text) => {
    const number = parseFloat(text);
    if (!isNaN(number)) {
      setValue(number);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Slider com Input</Text>

      {/* Slider */}
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={0}
        maximumValue={100}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#1fb28a"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1e5c5e"
      />
      
      {/* Caixa de Entrada ao lado do Slider */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={handleInputChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '80%',
    height: 40,
  },
  inputContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 60,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default SliderWithInput;
