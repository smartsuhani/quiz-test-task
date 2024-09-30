import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';
import {RootState} from '../store';

// Define the state for the user quiz data slice
interface UserQuizData {
  userId: string;
  category: string;
  question: string;
  selectedAnswer: string;
  answer: string; // This can be used for correct/incorrect status if needed
  options: string[]; // List of options
}

// Define the state for user quiz slice
interface UserQuizState {
  userQuizData: Record<string, UserQuizData[]>; // Keyed by userId
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserQuizState = {
  userQuizData: {},
  status: 'idle',
  error: null,
};

// Async action for updating user quiz data
export const updateUserQuizData = createAsyncThunk<void, UserQuizData>(
  'userQuiz/updateUserQuizData',
  async (data: UserQuizData) => {
    const {userId, category} = data;

    // Define the path in Firebase
    const userRef = firebase.database().ref('userQuizzes/');
    const userPointsRef = firebase
      .database()
      .ref(`userPoints/${userId}/points`);
    // Fetch current user points
    try {
      const pointsSnapshot = await userPointsRef.once('value');
      const currentPoints = pointsSnapshot.val();
      // Check if points are available and it's the first update
      if (currentPoints) {
        // Increment points by 1
        await userPointsRef.set(currentPoints + 1);
      } else {
        await userPointsRef.set(1);
      }
      // Push new quiz data under userId and category
      await userRef.child(userId).child(category).push(data);
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
    }
  },
);

// Create the slice
const userQuizDataSlice = createSlice<UserQuizState>({
  name: 'userQuiz',
  initialState,
  reducers: {
    // Optional: You can add other reducers for additional actions if necessary
    clearUserQuizData: state => {
      state.userQuizData = {};
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateUserQuizData.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserQuizData.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(updateUserQuizData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update user quiz data';
      });
  },
});

// Export the reducer and actions
export default userQuizDataSlice.reducer;
export const {clearUserQuizData} = userQuizDataSlice.actions;

// Selectors
export const selectUserQuizData = (state: RootState) =>
  state.userQuiz.userQuizData;
export const selectUserQuizStatus = (state: RootState) => state.userQuiz.status;
export const selectUserQuizError = (state: RootState) => state.userQuiz.error;
