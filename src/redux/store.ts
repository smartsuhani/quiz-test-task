// src/redux/store.ts
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import quizzesSlice from './slices/quizzesSlice';
import quizzesCategorySlice from './slices/quizzesCategorySlice';
import fetchUserQuizReducer from './slices/getUserQuizesSlice';
import userProfileReducer from './slices/userProfileSlice';
import quizReduce from './slices/userOwnQuizSlice';
import userPointsReducer from './slices/userPointsSlice';

// Combine your reducers using combineReducers
const appReducer = combineReducers({
  user: userReducer,
  userProfile: userProfileReducer,
  quizzes: quizzesSlice,
  quizzesCategory: quizzesCategorySlice,
  fetchUserQuiz: fetchUserQuizReducer,
  quiz: quizReduce,
  userPoints: userPointsReducer,
});

// Root reducer to handle LOGOUT action
const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    state = undefined; // This resets the entire state
  }
  return appReducer(state, action);
};

// Configure the store with the root reducer
export const store = configureStore({
  reducer: rootReducer,
});

// Export types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
