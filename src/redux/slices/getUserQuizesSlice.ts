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
  userQuizData: Record<string, UserQuizData[]> | null; // Record of category to array of user quiz data or null if not fetched
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FetchUserQuizState = {
  userQuizData: null,
  status: 'idle',
  error: null,
};

// Async action for fetching user quiz data for a specific category
export const fetchUserQuizData = createAsyncThunk<
  UserQuizData[],
  {uid: string; category: string}
>('userQuiz/fetchUserQuizData', async ({uid, category}) => {
  const userRef = firebase.database().ref(`userQuizzes/${uid}/${category}`);
  await userRef.keepSynced(true);
  const snapshot = await userRef.once('value'); // Fetch data
  const data = snapshot.val();
  // Transform data into an array if it exists
  return data ? Object.values(data) : [];
});

// Async action for fetching user quiz data for all categories
export const fetchAllCategoriesUserQuizData = createAsyncThunk<
  Record<string, UserQuizData[]>,
  {uid: string}
>('userQuiz/fetchAllCategoriesUserQuizData', async ({uid}) => {
  const userRef = firebase.database().ref(`userQuizzes/${uid}`);
  await userRef.keepSynced(true);
  const snapshot = await userRef.once('value'); // Fetch data
  const data = snapshot.val();

  if (!data) {
    return {};
  }

  // Transform data into a Record of category to array of quizzes
  const allQuizzes: Record<string, UserQuizData[]> = {};
  Object.keys(data).forEach(category => {
    allQuizzes[category] = Object.values(data[category]);
  });
  return allQuizzes;
});

// Create the slice
const fetchUserQuizSlice = createSlice({
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
          state.userQuizData = action.payload || []; // Store fetched data
        },
      )
      .addCase(fetchUserQuizData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user quiz data';
      })
      .addCase(fetchAllCategoriesUserQuizData.pending, state => {
        state.status = 'loading';
      })
      .addCase(
        fetchAllCategoriesUserQuizData.fulfilled,
        (state, action: PayloadAction<Record<string, UserQuizData[]>>) => {
          state.userQuizData = action.payload; // Store fetched data
          state.status = 'succeeded';
        },
      )
      .addCase(fetchAllCategoriesUserQuizData.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ||
          'Failed to fetch all categories user quiz data';
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
