import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ListaUtilizadoresPage = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIfAdmin = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const userDoc = await firestore().collection('clientes').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().roles === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        Alert.alert('Acesso negado', 'Não tem permissão para entrar na página pedida.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao verificar o papel do utilizador', error);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('clientes').where('roles', '==', 'cliente').get();
      console.log(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro a procurar os clientes', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchClientes();
    }
  }, [isAdmin]);

  const renderItem = ({ item }) => (
    <View style={styles.clientContainer}>
      <Text style={styles.clientText}>Nome: {item.nome}</Text>
      <Text style={styles.clientText}>Email: {item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.title}>Lista de Clientes</Text>
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </>
      )}
    </View>
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
  clientContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  clientText: {
    fontSize: 16,
  },
});

export default ListaUtilizadoresPage;
