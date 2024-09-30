import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import AddQuizScreen from '../screens/AddQuizScreen'; // Import the new HomeStackNavigator
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HomeStackNavigator from "./HomeNavigation";
import ProfileStackNavigator from "./ProfileNavigation";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ccc',
        },
        tabBarActiveTintColor: '#5591BD',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator} // Use the HomeStackNavigator
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddQuiz"
        component={AddQuizScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialIcons
              name="add-circle-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="profile" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
