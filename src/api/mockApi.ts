// src/api/mockApi.ts
import auth from '@react-native-firebase/auth';

export const firebaseLogin = async (
  email: string,
  password: string,
): Promise<string> => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
    return 'Login successful';
  } catch (error) {
    throw new Error(error.message);
  }
};

export const firebaseSignup = async (
  email: string,
  password: string,
): Promise<string> => {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
    return 'Signup successful';
  } catch (error) {
    throw new Error(error.message);
  }
};
