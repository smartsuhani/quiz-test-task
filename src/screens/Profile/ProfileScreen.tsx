import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  selectFullName,
  selectUserProfileLoading,
  selectUserProfileError,
  fetchFullName,
  updateFullName,
  clearUserProfile,
} from '../../redux/slices/userProfileSlice';
import auth from '@react-native-firebase/auth';
import {setLogout} from '../../redux/slices/userSlice';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocus(false);
    }, []),
  );

  useEffect(() => {
    dispatch(fetchFullName());
    return () => {
      setIsFocus(false);
    };
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
      dispatch(setLogout({message: 'Logged out successfully'})); // Dispatch logout action
      dispatch({type: 'LOGOUT'});
      dispatch(clearUserProfile());
      navigation.navigate('SignIn' as never);
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

    const user: any = auth().currentUser;
    if (user) {
      const emailCred = auth.EmailAuthProvider.credential(
        user?.email,
        currentPassword,
      );

      setIsLoading(true); // Start loading

      try {
        await user.reauthenticateWithCredential(emailCred);
        await user.updatePassword(newPassword);
        Alert.alert('Success', 'Password changed successfully!');
        setIsModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword(''); // Clear the current password field
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={[styles.backButton]}
            onPress={() => {
              navigation.goBack();
            }}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isSaveEnabled && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isSaveEnabled}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.profileContainer}>
            <FontAwesome5
              name="user-circle"
              size={100}
              color="black"
              style={styles.profileImage}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#6200ee" />
            ) : (
              <>
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TextInput
                  style={[
                    styles.fullNameInput,
                    {borderBottomWidth: isFocus ? 1 : 0},
                  ]}
                  value={fullName as string}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChangeText={setFullNameState}
                  placeholderTextColor={'#808080'}
                  placeholder="Full Name"
                />
                <Text style={{color: 'grey', marginBottom: 30}}>
                  (here you can update your full name)
                </Text>
                <View style={styles.email}>
                  <Text style={styles.email}>{user.email}</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsModalVisible(true)}>
              <View style={styles.changePasswordMain}>
                <MaterialIcons
                  name={'password'}
                  size={24}
                  color={'#5591BD' as number}
                />
                <Text style={styles.buttonText}>Change Password</Text>
              </View>
              <MaterialIcons
                name={'keyboard-arrow-right'}
                size={24}
                color={'#5591BD' as number}
              />
            </TouchableOpacity>
            <View style={styles.seperator} />
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('UserQuizzesScreen' as never)}>
              <View style={styles.myQuizMain}>
                <MaterialIcons
                  name={'my-library-books'}
                  size={24}
                  color={'#5591BD' as never}
                />
                <Text style={styles.buttonText}>My Quizzes</Text>
              </View>
              <MaterialIcons
                name={'keyboard-arrow-right'}
                size={24}
                color={'#5591BD' as number}
              />
            </TouchableOpacity>
            <View style={styles.seperator} />

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate('UserAttemptedQuizzesScreen' as never)
              }>
              <View style={styles.myQuizMain}>
                <MaterialIcons
                  name={'view-carousel'}
                  size={24}
                  color={'#5591BD' as number}
                />
                <Text style={styles.buttonText}>Attempted Quizzes</Text>
              </View>
              <MaterialIcons
                name={'keyboard-arrow-right'}
                size={24}
                color={'#5591BD' as number}
              />
            </TouchableOpacity>
            <View style={styles.seperator} />
            <TouchableOpacity
              style={[
                styles.button,
                {paddingVertical: 25, alignItems: 'center'},
              ]}
              onPress={handleLogout}>
              <View style={styles.myQuizMain}>
                <MaterialIcons
                  name={'logout'}
                  size={24}
                  color={'#F38686' as number}
                />
                <Text style={[styles.buttonText, {color: '#F38686'}]}>
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
              <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor={'#808080'}
                placeholder="Current Password"
                secureTextEntry
                autoFocus={true} // Automatically focuses the input when the modal opens
              />
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor={'#808080'}
                placeholder="New Password"
                secureTextEntry
              />
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={'#808080'}
                placeholder="Confirm Password"
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.modalButton, isLoading && styles.disabledButton]}
                onPress={handleChangePassword}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setCurrentPassword(''); // Clear the current password field
                }}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  changePasswordMain: {
    flexDirection: 'row',
    gap: 10,
  },
  myQuizMain: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: 0,
  },
  saveButton: {
    alignSelf: 'center',
    backgroundColor: '#5591BD',
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  backButton: {
    alignSelf: 'center',
    borderRadius: 8,
    zIndex: 999,
  },
  seperator: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
  },
  mainView: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 1,
    borderRadius: 20,
    padding: 2,
    backgroundColor: 'red',
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
    marginBottom: 25,
  },
  fullNameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#000',
    width: '70%',
    paddingBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'black',
    backgroundColor: '#C9DFEF',
    padding: 8,
    width: '100%',
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#5591BD',
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
    color: '#5591BD',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
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
});

export default ProfileScreen;
