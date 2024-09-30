// src/routing/MainNavigation.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {selectLogin} from '../redux/slices/userSlice';
import SplashScreen from '../screens/Auth/SplashScreen';
import AppCheckScreen from '../screens/Auth/AppCheckScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
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
          </>
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;
