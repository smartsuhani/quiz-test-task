import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';
import {QuizCategory} from '../../types/Quiz';
import {RootState} from '../store';

// Define the state for the quizzes slice
interface QuizzesState {
  quizzesCategory: QuizCategory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuizzesState = {
  quizzesCategory: [],
  status: 'idle',
  error: null,
};

// Async action for fetching quizzes
export const fetchQuizzesCategory = createAsyncThunk<QuizCategory[]>(
  'quizzesCategory/fetchQuizzesCategory',
  async () => {
    const ref1 = firebase.database().ref('/quizzesCategories');
    await ref1.keepSynced(true);
    const snapshot = await firebase
      .database()
      .ref('/quizzesCategories')
      .once('value');
    const quizzesArray = snapshot.val(); // This directly retrieves the array
    const quizzesCategory: QuizCategory[] = quizzesArray ? quizzesArray : [];
    return quizzesCategory;
  },
);

// Create the slice
const quizzesCategorySlice = createSlice<QuizzesState>({
  name: 'quizzesCategory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchQuizzesCategory.pending, (state: QuizzesState) => {
        state.status = 'loading';
      })
      .addCase(
        fetchQuizzesCategory.fulfilled,
        (state: QuizzesState, action: PayloadAction<QuizCategory[]>) => {
          state.status = 'succeeded';
          state.quizzesCategory = action.payload;
        },
      )
      .addCase(
        fetchQuizzesCategory.rejected,
        (state: QuizzesState, action: any) => {
          state.status = 'failed';
          state.error = action.error.message || 'Failed to fetch quizzes';
        },
      );
  },
});

// Export the reducer
export default quizzesCategorySlice.reducer;

// Selectors
export const selectAllQuizzesCategory = (state: RootState) =>
  state.quizzesCategory.quizzesCategory;
export const selectQuizzesCategoryStatus = (state: RootState) =>
  state.quizzesCategory.status;
export const selectQuizzesCategoryError = (state: RootState) =>
  state.quizzesCategory.error;
