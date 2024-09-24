// src/redux/store.ts
import {configureStore} from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import quizzesSlice from './slices/quizzesSlice';
import quizzesCategorySlice from './slices/quizzesCategorySlice';
import fetchUserQuizReducer from './slices/getUserQuizesSlice';
import userProfileReducer from './slices/userProfileSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    userProfile: userProfileReducer,
    quizzes: quizzesSlice,
    quizzesCategory: quizzesCategorySlice,
    fetchUserQuiz: fetchUserQuizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
