import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

import { auth } from '../firebase';

import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";

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
    signInWithEmailAndPassword(auth, username, password)
    .then(() => {
      navigation.navigate('Home');
      // ...
    })
    .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode)
            if(errorCode == 'auth/invalid-email' ){
                window.alert("Invalid email - please try again")
            }else if(errorCode == 'auth/user-not-found'){
                createUserWithEmailAndPassword(auth, username, password).then((userCredential) => {
                    navigation.navigate('Home');
                    }).catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        if(errorCode == 'auth/invalid-email' ){
                            window.alert("Invalid email - please try again")
                        }else if(errorCode == 'auth/weak-password'){
                            window.alert("Weak password - please try again (password must be at least 6 characters)")
                        }else{
                            window.alert("Unknown error - please try again")
                        }
                    }
                );

            }else if(errorCode == 'auth/wrong-password'){
                window.alert("Incorrect password - please try again")
            }else if(errorCode == 'auth/user-not-found'){
                window.alert("User not found - please try again")
            }else{
                window.alert("Unknown error - please try again")
            }

    });    
  };

  return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center', textAlign:'center' }}>
      <Text style={{fontSize:"1.4rem", paddingBottom:20,fontWeight:200}}>Sign in with</Text>
      <TextInput
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        style={{ marginTop: 10, marginBottom: 10, width: 200, padding: 10, borderWidth: 1 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20, width: 200, padding: 10, borderWidth: 1 }}
      />
      <Button color="#52c0de" title="Submit" onPress={handleLogin} />
      <Text style={{fontSize:"1.2rem", paddingTop:20, paddingBottom:20, fontWeight:200}}>Or</Text>
      <Button buttonStyle={{backgroundColor:"#52c0de"}} color="#52c0de" title="Sign in with Google" onPress={googleSignup} />
      </View>
  );
};

      //<Text style={{fontSize:"1.4rem", paddingTop:40, fontWeight:400}}>Create an account to keep track of which AI models <b>you</b> prefer!</Text>


LoginScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Login',
    headerRight: () => (
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    ),
  };
};

export default LoginScreen;
