import React, {useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal'; // Ensure you have installed this package
import {useDispatch, useSelector} from 'react-redux';
import {firebaseLogin, firebaseSignup} from '../../api/mockApi';
import {
  setLogin,
  setSubmitting,
  setLoginMessage,
} from '../../redux/slices/userSlice';
import {
  selectIsSubmitting,
  selectLoginMessage,
} from '../../redux/slices/userSlice';
import auth from '@react-native-firebase/auth';
import FastImage from 'react-native-fast-image';
import Images from '../../utils/Images';
import Icon from 'react-native-vector-icons/Ionicons'; // Import the Icon component
import ProgressBar from 'react-native-progress/Bar';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login and Signup
  const [isModalVisible, setIsModalVisible] = useState(false); // Forgot password modal visibility
  const [isLoginModalVisible, setLoginModalVisible] = useState(true); // Forgot password modal visibility
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [isLoading, setIsLoading] = useState(false); // Loading state for reset password
  const [isPasswordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  const dispatch = useDispatch();
  const isSubmitting = useSelector(selectIsSubmitting);
  const loginMessage = useSelector(selectLoginMessage);

  useEffect(() => {
    const av = new Animated.Value(0);
    av.addListener(() => {
      return;
    });
  }, []);

  const handleLogin = async () => {
    dispatch(setLoginMessage(''));
    dispatch(setSubmitting(true));
    try {
      setLoginModalVisible(false);
      await firebaseLogin(email, password);
      setLoginModalVisible(false);
      const user = auth().currentUser;
      dispatch(setLogin({email: email, uid: user.uid}));
    } catch (error) {
      setLoginModalVisible(true);
      dispatch(setLoginMessage(error.message));
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const handleSignup = async () => {
    dispatch(setSubmitting(true));
    try {
      setLoginModalVisible(false);
      await firebaseSignup(email, password);
      const user = auth().currentUser;
      dispatch(setLogin({email: email, uid: user.uid}));
    } catch (error) {
      setLoginModalVisible(true);
      dispatch(setLoginMessage(error.message));
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const handleAuth = () => {
    if (isLoginMode) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    console.log(resetEmail.toLowerCase());
    try {
      await auth().sendPasswordResetEmail(resetEmail.toLowerCase());
      dispatch(setLoginMessage('Password reset email sent successfully.'));
      setIsModalVisible(false);
      setResetEmail(''); // Clear email input after reset
    } catch (error) {
      console.log(error);
      dispatch(setLoginMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <FastImage
        style={{height: '100%', width: '100%', zIndex: -999}}
        source={Images.loginCartoon}
        resizeMode={FastImage.resizeMode.cover}
      />
      {isSubmitting && (
        <View style={styles.loadingContainer}>
          <ProgressBar
            width={209}
            height={5}
            color={'#5591BD'}
            unfilledColor={'grey'}
            borderWidth={0}
            indeterminate={true}
            useNativeDriver={true}
          />
        </View>
      )}
      <Modal
        isVisible={isLoginModalVisible}
        backdropOpacity={0}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{margin: 0}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <ScrollView
            contentContainerStyle={styles.modalContainer}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}>
            <View style={styles.modalContent}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    isLoginMode && styles.activeTabButton,
                  ]}
                  onPress={() => setIsLoginMode(true)}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      isLoginMode && styles.activeTabButtonText,
                    ]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    !isLoginMode && styles.activeTabButton,
                  ]}
                  onPress={() => setIsLoginMode(false)}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      !isLoginMode && styles.activeTabButtonText,
                    ]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {flex: 1, borderWidth: 0, marginBottom: 0, marginRight: 10},
                  ]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!isPasswordVisible)}>
                  <Icon
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleAuth}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLoginMode ? 'Sign In' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              {loginMessage ? (
                <Text
                  style={[
                    styles.error,
                    {
                      color: loginMessage.includes('successfully')
                        ? 'green'
                        : 'red',
                    },
                  ]}>
                  {loginMessage.includes('successfully')
                    ? loginMessage
                    : loginMessage.split(']')[1].trim()}
                </Text>
              ) : null}

              {
                <TouchableOpacity
                  disabled={!isLoginMode}
                  onPress={() => setIsModalVisible(true)}>
                  <Text
                    style={[
                      styles.forgotPassword,
                      {color: isLoginMode ? 'grey' : '#fff'},
                    ]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              }
            </View>
            <Modal
              isVisible={isModalVisible}
              backdropOpacity={0.5}
              onBackdropPress={() => setIsModalVisible(false)}
              style={{margin: 0}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}>
                <ScrollView
                  contentContainerStyle={styles.modalContainer}
                  keyboardShouldPersistTaps="handled">
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Reset Password</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoFocus={true} // Automatically focuses the input when the modal opens
                    />
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        isLoading && styles.disabledButton,
                      ]}
                      onPress={handlePasswordReset}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.modalButtonText}>
                          Send Reset Link
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                      <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </Modal>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#5591BD',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#5591BD',
    overflow: 'hidden',
  },
  tabButtonText: {
    color: '#ccc',
    fontSize: 18,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#5591BD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContent: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  forgotPassword: {
    color: 'grey',
    marginTop: 8,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  eyeIcon: {
    // position: 'absolute',
    right: 10,
    alignSelf: 'center',
  },
  modalButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    color: '#4285F4',
    marginTop: 16,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#b3d1ff',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    left: 0,
    top: 0,
    bottom: -500,
    right: 0,
  },
});
export default AuthScreen;
