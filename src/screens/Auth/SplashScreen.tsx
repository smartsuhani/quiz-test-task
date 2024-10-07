import React, {useCallback, useEffect, useRef} from 'react';
import {Text, TouchableOpacity, StyleSheet, View, Animated} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

const SplashScreen = ({navigation}): React.ReactElement => {
  const loaderWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        navigation.navigate('SignIn');
      }, 3000);

      return () => clearTimeout(timeout);
    }, [navigation]),
  );

  // Animate the loader (horizontal line) width from 0 to 100% over 3 seconds
  useEffect(() => {
    Animated.timing(loaderWidth, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false, // We need native driver off to animate width properly
    }).start();
  }, [loaderWidth]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.text}>Quiz App</Text>
        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.loader,
              {
                width: loaderWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A73E8',
  },
  text: {
    fontSize: 32,
    color: '#fff',
  },
  subText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  loaderContainer: {
    height: 4, // Height of the horizontal line
    width: '80%', // Total width for loader to animate
    backgroundColor: '#ccc', // Background for loader container
    marginVertical: 16,
  },
  loader: {
    height: '100%',
    backgroundColor: '#fff', // Color of the horizontal loader line
  },
});

export default SplashScreen;
