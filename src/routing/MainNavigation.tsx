// src/routing/MainNavigation.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {selectLogin} from '../redux/slices/userSlice';
import AppLoadingScreen from '../screens/AppLoadingScreen';
import HomeScreen from '../screens/Quizz/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';
import AppCheckScreen from '../screens/AppCheckScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TabNavigator from './TabNavigator';

const MainStack = createStackNavigator();

const MainNavigation = (): React.ReactElement => {
  const isLoggedIn = useSelector(selectLogin);

  return (
    <NavigationContainer>
      <MainStack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <>
            <MainStack.Screen name="TabNavigator" component={TabNavigator} />
            <MainStack.Screen name="AppCheck" component={AppCheckScreen} />
          </>
        ) : (
          <>
            <MainStack.Screen name="Splash" component={SplashScreen} />
            <MainStack.Screen name="SignIn" component={SignInScreen} />
            <MainStack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;
