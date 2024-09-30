// src/screens/AppLoadingScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AppLoadingScreen = (): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>App Loading Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
  },
});

export default AppLoadingScreen;
