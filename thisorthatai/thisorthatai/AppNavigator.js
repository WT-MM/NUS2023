import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';

const AppNavigator = createStackNavigator({
    Home: HomeScreen,
    Game: GameScreen,
}, {
    initialRouteName: 'Home',
});

export default createAppContainer(AppNavigator);
