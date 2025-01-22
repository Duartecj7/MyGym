import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const SocialButton = ({ imageSource, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Image source={imageSource} style={styles.image} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 50,
    overflow: 'hidden', 
  },
  image: {
    width: 50, 
    height: 50,
    resizeMode: 'contain', 
  },
});

export default SocialButton;
