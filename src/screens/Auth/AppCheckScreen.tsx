// src/screens/AppCheckScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AppCheckScreen = (): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>App Check Screen</Text>
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

export default AppCheckScreen;
