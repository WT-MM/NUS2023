import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Input } from 'react-native-elements';



import {auth} from '../firebase';

import {createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const HomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.toptitle}>Welcome To</Text>
        <Text style={styles.title}>This or That (AI Edition)</Text>
        <Button buttonStyle={{backgroundColor:"#2fa0f7"}} style={[{paddingBottom:"2vh"}]} color="#2fa0f7" title="Play with Pics"  onPress={() => {navigation.navigate('Pick a Pic')}}/>
        <Button buttonStyle={{backgroundColor:"#2fa0f7"}} title="Play with Paragraphs" onPress={() => {navigation.navigate('Pick a Paragraph')}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },
    toptitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20
    },
  button: {
    backgroundColor: '#38a8c7',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
    height: 48,
  },
});

export default HomeScreen;
