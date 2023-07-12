import React from 'react';
import { View, Text, Button } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/ImageGameScreen';
import LoginScreen from './screens/LoginScreen';

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Game: GameScreen,
    Login: {
        screen: LoginScreen,
        navigationOptions: {
          headerShown: true,
          title: 'Login',
          headerRight: () => (
            <Button
              title="Register"
              onPress={() => navigation.navigate('Login')}
            />
          ),
        },
    }
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e', // Customize the background color of the header
      },
      headerTintColor: 'white', // Customize the text color of the header buttons
      headerTitleStyle: {
        fontWeight: 'bold', // Customize the font weight of the header title
      },
    },
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
