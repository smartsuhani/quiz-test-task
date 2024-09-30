import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {firebaseSignup} from '../api/mockApi';
import {
  setLogin,
  setSubmitting,
  setLoginMessage,
} from '../redux/slices/userSlice';
import {
  selectIsSubmitting,
  selectLoginMessage,
} from '../redux/slices/userSlice';

const SignUpScreen = ({navigation}): React.ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const isSubmitting = useSelector(selectIsSubmitting);
  const loginMessage = useSelector(selectLoginMessage);

  const handleSignup = async () => {
    dispatch(setSubmitting(true));
    try {
      await firebaseSignup(email, password);
      dispatch(setLogin({email}));
    } catch (error) {
      dispatch(setLoginMessage(error.message));
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️</Text>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={isSubmitting}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {loginMessage ? <Text style={styles.error}>{loginMessage}</Text> : null}
      <TouchableOpacity
        onPress={() => {
          dispatch(setLoginMessage(''));
          navigation.navigate('SignIn');
        }}>
        <Text style={styles.signUpText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Reuse the same styles as SignInScreen
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A73E8',
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  signUpText: {
    marginTop: 16,
    color: '#fff',
  },
});

export default SignUpScreen;
