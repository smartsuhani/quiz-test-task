import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';
import {RootState} from '../store';

// Define the structure for a quiz
interface QuizData {
  id: string; // Firebase id for the quiz
  question: string;
  options: string[]; // Array of options (can be 2, 3, or 4)
  correct_answer: string;
}

// Define the state for the quiz slice
interface QuizState {
  quizzes: Record<string, Record<string, Record<string, QuizData>>>; // Uid -> category -> firebaseId -> QuizData
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuizState = {
  quizzes: {},
  status: 'idle',
  error: null,
};

// Async action for adding quiz data
export const addQuizData = createAsyncThunk<
  void,
  {userId: string; category: string; quizData: Omit<QuizData, 'id'>}
>('quiz/addQuizData', async ({userId, category, quizData}) => {
  const userRef = firebase.database().ref('userQuizzesDATA/');
  const AllQuizRef = firebase.database().ref(`quizzes/${category}`);

  try {
    const newQuizRef = await userRef.child(userId).child(category).push();
    const allQuizzes = await AllQuizRef.push();
    const quizId = newQuizRef.key;

    if (quizId) {
      await newQuizRef.set({...quizData, id: quizId});
      await allQuizzes.set({...quizData, id: quizId});
      console.log('Quiz added successfully!');
    }
  } catch (error) {
    console.error('Error adding quiz to Firebase:', error);
  }
});

// Async action for fetching quizzes for a specific category
export const fetchQuizzes = createAsyncThunk<
  Record<string, QuizData>,
  {userId: string; category: string}
>('quiz/fetchQuizzes', async ({userId, category}) => {
  const userRef = firebase
    .database()
    .ref(`userQuizzesDATA/${userId}/${category}`);
  const snapshot = await userRef.once('value');
  const quizzesData = snapshot.val();

  if (quizzesData) {
    return quizzesData; // Return the quizzes fetched from Firebase
  } else {
    return {}; // Return an empty object if no quizzes found
  }
});

// Async action for fetching all quizzes added by users
export const fetchAllQuizzes = createAsyncThunk<
  Record<string, Record<string, Record<string, QuizData>>>, // Returning a nested object: userId -> category -> quizzes
  void
>('quiz/fetchAllQuizzes', async () => {
  const userRef = firebase.database().ref('userQuizzesDATA/');
  await userRef.keepSynced(true);
  const snapshot = await userRef.once('value');
  const allQuizzesData = snapshot.val();

  if (allQuizzesData) {
    return allQuizzesData; // Return all quizzes fetched from Firebase
  } else {
    return {}; // Return an empty object if no quizzes found
  }
});

// Async action for updating user quiz data
export const updateUserQuizData = createAsyncThunk<
  void,
  {
    userId: string;
    category: string;
    quizId: string;
    quizData: Partial<QuizData>;
  }
>('quiz/updateUserQuizData', async ({userId, category, quizId, quizData}) => {
  const userQuizRef = firebase
    .database()
    .ref(`userQuizzesDATA/${userId}/${category}/${quizId}`);
  try {
    console.log(quizData);
    await userQuizRef.update(quizData);
    console.log('Quiz updated successfully!');
  } catch (error) {
    console.error('Error updating quiz in Firebase:', error);
  }
});

// Async action for deleting user quiz data
export const deleteUserQuizData = createAsyncThunk<
  void,
  {userId: string; category: string; quizId: string}
>('quiz/deleteUserQuizData', async ({userId, category, quizId}) => {
  const userQuizRef = firebase
    .database()
    .ref(`userQuizzesDATA/${userId}/${category}/${quizId}`);
  const userOtherRef = firebase.database().ref(`quizzes/${category}/${quizId}`);
  try {
    await userOtherRef.remove();
    await userQuizRef.remove();
    console.log('Quiz deleted successfully!', userId, category, quizId);
  } catch (error) {
    console.error('Error deleting quiz from Firebase:', error);
  }
});

// Create the quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearQuizData: state => {
      state.quizzes = {};
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addQuizData.pending, (state: QuizState) => {
        state.status = 'loading';
      })
      .addCase(addQuizData.fulfilled, (state: QuizState) => {
        state.status = 'succeeded';
      })
      .addCase(addQuizData.rejected, (state: QuizState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add quiz data';
      })
      .addCase(fetchQuizzes.pending, (state: QuizState) => {
        state.status = 'loading';
      })
      .addCase(fetchQuizzes.fulfilled, (state: QuizState, action: any) => {
        const {userId, category} = action.meta.arg;
        if (!state.quizzes[userId]) {
          state.quizzes[userId] = {};
        }
        state.quizzes[userId][category] = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchQuizzes.rejected, (state: QuizState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch quizzes';
      })
      .addCase(fetchAllQuizzes.pending, (state: QuizState) => {
        state.status = 'loading';
      })
      .addCase(fetchAllQuizzes.fulfilled, (state: QuizState, action) => {
        state.quizzes = action.payload; // Replace the current quizzes with all fetched quizzes
        state.status = 'succeeded';
      })
      .addCase(fetchAllQuizzes.rejected, (state: QuizState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch all quizzes';
      })
      .addCase(updateUserQuizData.pending, (state: QuizState) => {
        state.status = 'loading';
      })
      .addCase(updateUserQuizData.fulfilled, (state: QuizState) => {
        state.status = 'succeeded';
      })
      .addCase(updateUserQuizData.rejected, (state: QuizState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update quiz data';
      })
      .addCase(deleteUserQuizData.pending, (state: QuizState) => {
        state.status = 'loading';
      })
      .addCase(
        deleteUserQuizData.fulfilled,
        (state: QuizState, action: any) => {
          const {userId, category, quizId} = action.meta.arg;
          if (state.quizzes[userId] && state.quizzes[userId][category]) {
            delete state.quizzes[userId][category][quizId];
          }
          state.status = 'succeeded';
        },
      )
      .addCase(deleteUserQuizData.rejected, (state: QuizState, action: any) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete quiz data';
      });
  },
});

// Export the reducer and actions
export default quizSlice.reducer;
export const {clearQuizData} = quizSlice.actions;

// Selectors
export const selectQuizData = (
  state: RootState,
  userId: string,
  category: string,
) => state.quiz.quizzes[userId]?.[category] || {};
export const selectAllOwnQuizzes = (state: RootState) => state.quiz.quizzes; // Selector to get all quizzes
export const selectQuizStatus = (state: RootState) => state.quiz.status;
export const selectQuizError = (state: RootState) => state.quiz.error;
