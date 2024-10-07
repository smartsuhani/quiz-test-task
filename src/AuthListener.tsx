// src/AuthListener.tsx
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import auth from '@react-native-firebase/auth';
import {setLogin} from './redux/slices/userSlice';

const AuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(setLogin({email: user.email || '', uid: user.uid || ''}));
      }
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, [dispatch]);

  return null; // This component does not render anything
};

export default AuthListener;
