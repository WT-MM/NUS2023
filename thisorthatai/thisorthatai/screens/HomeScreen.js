import React, { useState } from 'react';
import { Button, View, Text, StyleSheet, TextInput } from 'react-native';
import {auth} from '../firebase';

const HomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredentials => {
        // Navigate to the GameScreen if sign up was successful.
        navigation.navigate('Game');
      })
      .catch(error => console.log(error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the This or That Game!</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

// Add styles for TextInput
const styles = StyleSheet.create({
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  // the rest of your styles...
});

export default HomeScreen;
