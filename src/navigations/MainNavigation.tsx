// src/navigations/MainNavigation.tsx
import React from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {selectLogin} from '../redux/slices/userSlice';
import SplashScreen from '../screens/Auth/SplashScreen';
import AppCheckScreen from '../screens/Auth/AppCheckScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import UserAttemptedQuizzesScreen from '../screens/Profile/UserAttemptedQuizzesScreen';
import UserQuizzesScreen from '../screens/Profile/UserQuizzesScreen';
import UpdateQuizScreen from '../screens/Profile/UpdateQuizzesScreen';
import HomeScreen from '../screens/Quizz/HomeScreen';
import QuizScreen from '../screens/Quizz/QuizScreen';

type AuthStackParamList = {
  Splash: undefined;
  SignIn: undefined;
};

export type AppStackParamList = {
  HomeScreen: undefined;
  QuizScreen: undefined;
  ProfileScreen: undefined;
  UserAttemptedQuizzesScreen: undefined;
  UserQuizzesScreen: undefined;
  UpdateQuizScreen: undefined;
  AppCheck: undefined;
};

type MainStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

const MainStack = createStackNavigator<MainStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{headerShown: false}}>
    <AuthStack.Screen name="Splash" component={SplashScreen} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
  </AuthStack.Navigator>
);

const AppNavigator = () => {
  const forFade = ({current}) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });
  return (
    <AppStack.Navigator screenOptions={{headerShown: false}}>
      <AppStack.Screen name="HomeScreen" component={HomeScreen} />
      <AppStack.Screen name="QuizScreen" component={QuizScreen} />
      <AppStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <AppStack.Screen
        name="UserAttemptedQuizzesScreen"
        component={UserAttemptedQuizzesScreen}
      />
      <AppStack.Screen name="UserQuizzesScreen" component={UserQuizzesScreen} />
      <AppStack.Screen
        name="UpdateQuizScreen"
        component={UpdateQuizScreen}
        options={{cardStyleInterpolator: forFade}}
      />
      <AppStack.Screen name="AppCheck" component={AppCheckScreen} />
    </AppStack.Navigator>
  );
};

const MainNavigation = (): React.ReactElement => {
  const isLoggedIn = useSelector(selectLogin);

  return (
    <NavigationContainer>
      <MainStack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <MainStack.Screen name="App" component={AppNavigator} />
        ) : (
          <MainStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;
