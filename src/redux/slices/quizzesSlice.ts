import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';
import {Quiz} from '../../types/Quiz';
import {RootState} from '../store';

// Define the state for the quizzes slice
interface QuizzesState {
  quizzes: Quiz[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuizzesState = {
  quizzes: [],
  status: 'idle',
  error: null,
};

// Async action for fetching quizzes
export const fetchQuizzes = createAsyncThunk<Quiz[], string>(
  'quizzes/fetchQuizzes',
  async category => {
    const snapshot = await firebase
      .database()
      .ref(`/quizzes/${category}`)
      .once('value');
    const quizzesObject = snapshot.val();
    const quizzes: Quiz[] = quizzesObject
      ? Object.keys(quizzesObject).map(key => ({
          id: key,
          ...quizzesObject[key],
        }))
      : [];
    return quizzes;
  },
);

// Create the slice
const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearState: state => {
      state.quizzes = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchQuizzes.pending, (state: QuizzesState) => {
        state.status = 'loading';
      })
      .addCase(
        fetchQuizzes.fulfilled,
        (state: QuizzesState, action: PayloadAction<Quiz[]>) => {
          state.status = 'succeeded';
          state.quizzes = action.payload || [];
        },
      )
      .addCase(fetchQuizzes.rejected, (state: QuizzesState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch quizzes';
      });
  },
});

// Export the reducer
export default quizzesSlice.reducer;

// Export the action
export const {clearState} = quizzesSlice.actions;

// Selectors
export const selectAllQuizzes = (state: RootState) => state.quizzes.quizzes;
export const selectQuizzesStatus = (state: RootState) => state.quizzes.status;
export const selectQuizzesError = (state: RootState) => state.quizzes.error;
