// src/App.tsx
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import AuthListener from './src/AuthListener';
import {firebase} from '@react-native-firebase/database';
import MainNavigation from './src/navigations/MainNavigation';

const App = (): React.ReactElement => {
  useEffect(() => {
    firebase.database().setPersistenceCacheSizeBytes(100 * 1024 * 1024);
    firebase.database().setPersistenceEnabled(true);
  }, []);
  return (
    <Provider store={store}>
      <AuthListener />
      <MainNavigation />
    </Provider>
  );
};

export default App;
