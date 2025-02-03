import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MenuUser from '../components/MenuUser';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { useNavigation } from '@react-navigation/native';
const HomeScreen = () => {
  const route = useRoute();
  const [role, setRole] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params) {
      const { role, clientEmail } = route.params; 
      setRole(role); 
      console.log('Client email:', clientEmail); 
      console.log('Client Role:', role);
    }
  }, [route.params]);
  

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
          <MenuUser  navigation={navigation} role={role} clienteId={route.params?.clienteId} />
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  userIconContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  userIcon: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
  },
  submenuContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  submenuButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  submenuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
