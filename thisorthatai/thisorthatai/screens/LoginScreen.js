import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

import { auth } from '../firebase';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const provider = new GoogleAuthProvider();

  const googleSignup = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    }).then(() => {
        console.log(auth.currentUser)
        navigation.navigate('Home');
        }
    );
  };

  const handleLogin = () => {
    // Perform login actions here
    // For example, you can check the credentials and navigate to the home screen if they are valid
    if (username === 'admin' && password === 'password') {
      navigation.navigate('Home');
    } else {
      // Handle invalid credentials
      alert('Invalid username or password');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ marginTop: 10, marginBottom: 10, width: 200, padding: 10, borderWidth: 1 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, width: 200, padding: 10, borderWidth: 1 }}
      />
      <Button title="Login" onPress={handleLogin} />
      <br style={{margintop:"10"}}></br>
      <Button title="Login with Google" onPress={googleSignup} />
    </View>
  );
};

LoginScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Login',
    headerRight: () => (
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    ),
  };
};

export default LoginScreen;
