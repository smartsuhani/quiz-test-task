// src/redux/slices/fetchUserQuizSlice.ts
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';
import {RootState} from '../store';

// Define the state for the fetched user quiz data
interface UserQuizData {
  uid: string;
  category: string;
  question: string;
  selectedAnswer: string;
  answer: string;
  options: string[];
}

// Define the state for the fetch user quiz slice
interface FetchUserQuizState {
  userQuizData: UserQuizData[] | null; // Array of user quiz data or null if not fetched
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FetchUserQuizState = {
  userQuizData: null,
  status: 'idle',
  error: null,
};

// Async action for fetching user quiz data
export const fetchUserQuizData = createAsyncThunk<
  UserQuizData[],
  {uid: string; category: string}
>('userQuiz/fetchUserQuizData', async ({uid, category}) => {
  const userRef = firebase.database().ref(`userQuizzes/${uid}/${category}`);
  const snapshot = await userRef.once('value'); // Fetch data
  const data = snapshot.val();
  // Transform data into an array if it exists
  return data ? Object.values(data) : [];
});

// Create the slice
const fetchUserQuizSlice = createSlice<FetchUserQuizState>({
  name: 'fetchUserQuiz',
  initialState,
  reducers: {
    clearUserQuizData: state => {
      state.userQuizData = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserQuizData.pending, state => {
        state.status = 'loading';
      })
      .addCase(
        fetchUserQuizData.fulfilled,
        (state, action: PayloadAction<UserQuizData[]>) => {
          state.status = 'succeeded';
          state.userQuizData = action.payload; // Store fetched data
        },
      )
      .addCase(fetchUserQuizData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user quiz data';
      });
  },
});

// Export the reducer and actions
export default fetchUserQuizSlice.reducer;
export const {clearUserQuizData} = fetchUserQuizSlice.actions;

// Selectors
export const selectFetchedUserQuizData = (state: RootState) =>
  state.fetchUserQuiz.userQuizData;
export const selectFetchUserQuizStatus = (state: RootState) =>
  state.fetchUserQuiz.status;
export const selectFetchUserQuizError = (state: RootState) =>
  state.fetchUserQuiz.error;
