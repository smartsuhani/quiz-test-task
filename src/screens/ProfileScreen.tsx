import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  selectFullName,
  selectUserProfileLoading,
  selectUserProfileError,
  fetchFullName,
  updateFullName,
} from '../redux/slices/userProfileSlice';
import auth from '@react-native-firebase/auth';
import { setLogout } from '../redux/slices/userSlice';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const storedFullName = useSelector(selectFullName);
  const loading = useSelector(selectUserProfileLoading);
  const error = useSelector(selectUserProfileError);

  const [fullName, setFullNameState] = useState(storedFullName);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    dispatch(fetchFullName());
  }, [dispatch]);

  useEffect(() => {
    setFullNameState(storedFullName);
  }, [storedFullName]);

  useEffect(() => {
    setIsSaveEnabled(fullName !== storedFullName && fullName !== '');
  }, [fullName, storedFullName]);

  const handleLogout = async () => {
    try {
      await auth().signOut(); // Sign out from Firebase
      dispatch(setLogout({ message: 'Logged out successfully' })); // Dispatch logout action
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = () => {
    if (isSaveEnabled) {
      dispatch(updateFullName(fullName));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const user = auth().currentUser;
    if (user) {
      try {
        await user.updatePassword(newPassword);
        Alert.alert('Success', 'Password changed successfully!');
        setIsModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isSaveEnabled && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isSaveEnabled}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: 'https://placekitten.com/100/100' }}
              style={styles.profileImage}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#6200ee" />
            ) : (
              <>
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TextInput
                  style={styles.fullNameInput}
                  value={fullName}
                  onChangeText={setFullNameState}
                  placeholder="Full Name"
                />
                <Text style={styles.email}>{user.email}</Text>
              </>
            )}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsModalVisible(true)}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('MyQuizzes')}>
              <Text style={styles.buttonText}>My Quizzes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('AttemptedQuizzes')}>
              <Text style={styles.buttonText}>Attempted Quizzes</Text>
            </TouchableOpacity>
          </View>

          {/* Change Password Modal */}
          {/*<Modal*/}
          {/*  isVisible={true}*/}
          {/*  style={{*/}
          {/*    shadowOffset: {*/}
          {/*      width: 1,*/}
          {/*      height: 0,*/}
          {/*    },*/}
          {/*    shadowOpacity: 0.2,*/}
          {/*    shadowRadius: 5,*/}
          {/*    elevation: 3,*/}
          {/*    marginHorizontal: 12,*/}
          {/*    marginBottom: 60,*/}
          {/*  }}*/}
          {/*  backdropOpacity={0}>*/}
          {/*  <ScrollView*/}
          {/*    scrollEnabled={false}*/}
          {/*    keyboardShouldPersistTaps={'handled'}*/}
          {/*    // keyboardDismissMode='none'*/}
          {/*    keyboardDismissMode="on-drag"*/}
          {/*    contentContainerStyle={{flex: 1, backgroundColor: 'transparent'}}>*/}
          {/*    <KeyboardAwareScrollView animated={true}>*/}
          {/*      <View*/}
          {/*        style={{*/}
          {/*          ...styles.mainView,*/}
          {/*          backgroundColor: '#FFF',*/}
          {/*        }}>*/}
          {/*        <Text*/}
          {/*          style={[*/}
          {/*            styles.enterEmailTitle,*/}
          {/*            {color: 'black', fontWeight: 'bold', fontSize: 26},*/}
          {/*          ]}>*/}
          {/*          Login*/}
          {/*        </Text>*/}
          {/*        <View style={styles.userInputView}>*/}
          {/*          <View*/}
          {/*            style={{*/}
          {/*              flexDirection: 'row',*/}
          {/*              padding: 10,*/}
          {/*              width: Metrics.screenWidth - 44,*/}
          {/*              backgroundColor: '#FFF',*/}
          {/*              borderRadius: 5,*/}
          {/*              marginBottom: 20,*/}
          {/*              alignItems: 'center',*/}
          {/*              justifyContent: 'space-between',*/}
          {/*              gap: 5,*/}
          {/*              alignSelf: 'center',*/}
          {/*              borderWidth: 0.2,*/}
          {/*            }}>*/}
          {/*            <View style={{flexDirection: 'column', flex: 1}}>*/}
          {/*              <FloatingTextInput*/}
          {/*                label="Username"*/}
          {/*                value={email}*/}
          {/*                onChangeText={e => setEmail(e?.trim())}*/}
          {/*                titleActiveSize={12}*/}
          {/*                titleInActiveSize={15}*/}
          {/*                titleActiveColor={appThemeColor.secondaryText}*/}
          {/*                titleInactiveColor={appThemeColor.secondaryText}*/}
          {/*              />*/}
          {/*            </View>*/}
          {/*          </View>*/}
          {/*          {isError.type === 'username' && (*/}
          {/*            <View style={styles.errorTextView}>*/}
          {/*              <InfoIcon color={'red'} />*/}
          {/*              <Text style={styles.errorText}>{isError.message}</Text>*/}
          {/*            </View>*/}
          {/*          )}*/}
          {/*        </View>*/}
          {/*        <View style={styles.passwordView}>*/}
          {/*          <View*/}
          {/*            style={{*/}
          {/*              flexDirection: 'row',*/}
          {/*              padding: 10,*/}
          {/*              width: Metrics.screenWidth - 44,*/}
          {/*              backgroundColor: '#FFF',*/}
          {/*              borderRadius: 5,*/}
          {/*              marginBottom: 20,*/}
          {/*              alignItems: 'center',*/}
          {/*              justifyContent: 'space-between',*/}
          {/*              gap: 5,*/}
          {/*              alignSelf: 'center',*/}
          {/*              borderWidth: 0.2,*/}
          {/*            }}>*/}
          {/*            <View style={{flexDirection: 'column', flex: 1}}>*/}
          {/*              <FloatingTextInput*/}
          {/*                label="Password"*/}
          {/*                value={password}*/}
          {/*                secureTextEntry={showPassword}*/}
          {/*                onChangeText={e => setPassword(e?.trim())}*/}
          {/*                titleActiveSize={12}*/}
          {/*                titleInActiveSize={15}*/}
          {/*                titleActiveColor={appThemeColor.secondaryText}*/}
          {/*                titleInactiveColor={appThemeColor.secondaryText}*/}
          {/*              />*/}
          {/*            </View>*/}
          {/*            <TouchableOpacity*/}
          {/*              activeOpacity={0.8}*/}
          {/*              style={styles.eyeBtn}*/}
          {/*              testID="eye-icon"*/}
          {/*              onPress={() => {*/}
          {/*                setShowPassword(!showPassword);*/}
          {/*              }}>*/}
          {/*              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}*/}
          {/*            </TouchableOpacity>*/}
          {/*          </View>*/}
          {/*          {isError.type === 'password' && (*/}
          {/*            <View style={styles.errorTextView}>*/}
          {/*              <InfoIcon color={PRIMARY_COLOR} />*/}
          {/*              <Text style={styles.errorText}>*/}
          {/*                The password entered is incorrect*/}
          {/*              </Text>*/}
          {/*            </View>*/}
          {/*          )}*/}
          {/*          {isError.type === 'Both' && (*/}
          {/*            <View style={styles.errorTextView2}>*/}
          {/*              <InfoIcon color={'red'} />*/}
          {/*              <Text style={styles.errorText}>{isError.message}</Text>*/}
          {/*            </View>*/}
          {/*          )}*/}
          {/*        </View>*/}
          {/*        <View style={styles.btnView}>*/}
          {/*          <View testID="Login Button">*/}
          {/*            <Pressable*/}
          {/*              style={[*/}
          {/*                styles.loginBtn,*/}
          {/*                {paddingVertical: loading ? 10 : 14},*/}
          {/*              ]}*/}
          {/*              onPress={handleLogin}>*/}
          {/*              {loading ? (*/}
          {/*                <LoaderKit*/}
          {/*                  style={styles.loader}*/}
          {/*                  name={'LineScale'}*/}
          {/*                  color={PRIMARY_COLOR}*/}
          {/*                />*/}
          {/*              ) : (*/}
          {/*                <Text style={styles.loginText}>Login</Text>*/}
          {/*              )}*/}
          {/*            </Pressable>*/}
          {/*          </View>*/}
          {/*        </View>*/}
          {/*      </View>*/}
          {/*    </KeyboardAwareScrollView>*/}
          {/*  </ScrollView>*/}
          {/*</Modal>*/}
          <Modal
            transparent={true}
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New Password"
                  secureTextEntry
                />
                <TextInput
                  style={styles.modalInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry
                />
                <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                  <Text style={styles.modalButtonText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  saveButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  fullNameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#777',
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background for the modal
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#6200ee',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
