import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const TextInputField = ({ placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
  />
);

const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white"
  },
});

export default TextInputField;
