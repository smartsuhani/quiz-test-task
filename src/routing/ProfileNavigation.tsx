// src/navigation/ProfileNavigation.tsx
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import UserAttemptedQuizzesScreen from '../screens/UserAttemptedQuizzesScreen';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import UserQuizzesScreen from '../screens/UserQuizzesScreen';
import UpdateQuizScreen from '../screens/UpdateQuizzesScreen';
const ProfileStack = createStackNavigator();

const ProfileStackNavigator = () => {
  const navigation = useNavigation();
  const forFade = ({current}) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });
  useFocusEffect(
    React.useCallback(() => {
      // This will run when the Profile tab is focused
      const resetProfileStack = () => {
        navigation.navigate('ProfileScreen'); // Navigate back to the initial screen
      };

      // Subscribe to the focus event
      const unsubscribe = navigation.addListener('focus', resetProfileStack);

      // Cleanup the listener on unmount
      return unsubscribe;
    }, [navigation]),
  );

  return (
    <ProfileStack.Navigator initialRouteName={'ProfileScreen'}>
      <ProfileStack.Screen
        name="ProfileScreen"
        options={{headerShown: false}}
        component={ProfileScreen}
      />
      <ProfileStack.Screen
        name="UserAttemptedQuizzesScreen"
        options={{headerShown: false}}
        component={UserAttemptedQuizzesScreen}
      />
      <ProfileStack.Screen
        name="UserQuizzesScreen"
        options={{headerShown: false}}
        component={UserQuizzesScreen}
      />
      <ProfileStack.Screen
        name="UpdateQuizScreen"
        options={{headerShown: false, cardStyleInterpolator: forFade}}
        component={UpdateQuizScreen}
      />
    </ProfileStack.Navigator>
  );
};

export default ProfileStackNavigator;
