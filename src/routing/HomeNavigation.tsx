import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/Quizz/HomeScreen';
import QuizScreen from '../screens/Quizz/QuizScreen';

// Define the Stack Navigator for the Home Tab
const HomeStack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        options={{headerShown: false}}
        component={HomeScreen}
      />
      <HomeStack.Screen
        name="QuizScreen"
        options={{headerShown: false}}
        component={QuizScreen}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator;
