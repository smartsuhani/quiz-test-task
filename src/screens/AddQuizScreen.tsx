// src/screens/AddQuizScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddQuizScreen = (): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Quiz Screen</Text>
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

export default AddQuizScreen;
