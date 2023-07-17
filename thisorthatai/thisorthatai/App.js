import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Dialog } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { auth } from './firebase';

import { onAuthStateChanged } from 'firebase/auth';

import HomeScreen from './screens/HomeScreen';
import ImageGameScreen from './screens/ImageGameScreen';
import LoginScreen from './screens/LoginScreen';
import TextGameScreen from './screens/TextGameScreen';

const AppNavigator = createStackNavigator();

// A new component for the header right button
function HeaderRight({ user }) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const navigation = useNavigation();

  const signOut = () => {
    auth
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch((error) => console.log(error));
  };

  const showDialog = () => {
    setDialogVisible(true);
  };

  const handleCancel = () => {
    setDialogVisible(false);
  };

  const handleLogout = () => {
    signOut();
    setDialogVisible(false);
  };

  if (user) {
    if(user.photoURL == null){
      user.photoURL = "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
    }
    return (
      <View style={{ paddingRight: 10 }}>
        <TouchableOpacity onPress={showDialog}>
          <Avatar
            rounded
            source={{
              uri: user.photoURL,
            }}
          />
        </TouchableOpacity>
        <Dialog style={{width:"10vw"}} isVisible={dialogVisible}>
          <View style={{}}>
            <Text style={{textAlign:"center",fontSize:30,fontWeight:300,marginBottom:20}}>Are you sure you want to log out?</Text>
              <Button title="Log out" onPress={handleLogout} />
              <br style={{marginTop:"10"}}></br>
              <Button title="Cancel" onPress={handleCancel} />
          </View>

        </Dialog>
      </View>
    );
  }

  return (
    <View style={{ paddingRight: 10 }}>
    <Button
      onPress={() => navigation.navigate('Login')}
      title="Login"
      color="#000"
    />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // listen for user auth state changes
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    })
  }, []);

  return (
    <>
      <NavigationContainer>
        <AppNavigator.Navigator initialRouteName="Home">
          <AppNavigator.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen 
            name="Pick a Pic" 
            component={ImageGameScreen} 
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen 
            name="Pick a Paragraph" 
            component={TextGameScreen} 
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen name="Login" component={LoginScreen} />
        </AppNavigator.Navigator>
        
      </NavigationContainer>
    </>
  );
}
