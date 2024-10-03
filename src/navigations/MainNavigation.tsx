// src/navigations/MainNavigation.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
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

const MainStack = createStackNavigator();

const MainNavigation = (): React.ReactElement => {
  const isLoggedIn = useSelector(selectLogin);
  const forFade = ({current}) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });
  return (
    <NavigationContainer>
      <MainStack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <>
            <MainStack.Screen
              name="HomeScreen"
              options={{headerShown: false}}
              component={HomeScreen}
            />
            <MainStack.Screen
              name="QuizScreen"
              options={{headerShown: false}}
              component={QuizScreen}
            />
            <MainStack.Screen
              name="ProfileScreen"
              options={{headerShown: false}}
              component={ProfileScreen}
            />
            <MainStack.Screen
              name="UserAttemptedQuizzesScreen"
              options={{headerShown: false}}
              component={UserAttemptedQuizzesScreen}
            />
            <MainStack.Screen
              name="UserQuizzesScreen"
              options={{headerShown: false}}
              component={UserQuizzesScreen}
            />
            <MainStack.Screen
              name="UpdateQuizScreen"
              options={{headerShown: false, cardStyleInterpolator: forFade}}
              component={UpdateQuizScreen}
            />
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
