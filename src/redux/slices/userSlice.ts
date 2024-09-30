// src/redux/slices/userSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { RootState } from "../store";

interface UserState {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  loginMessage: string;
  email: string | null;
  uid: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  isSubmitting: false,
  loginMessage: '',
  email: null,
  uid: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin(state, action: PayloadAction<{email: string, uid: string}>) {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.uid = action.payload.uid;
    },
    setLogout(state) {
      state.isLoggedIn = false;
      state.email = null;
      state.uid = null;
    },
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    setLoginMessage(state, action: PayloadAction<string>) {
      state.loginMessage = action.payload;
    },
  },
});

export const {setLogin, setLogout, setSubmitting, setLoginMessage} =
  userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectLogin = (state: RootState) => state.user.isLoggedIn;
export const selectIsSubmitting = (state: RootState) => state.user.isSubmitting;
export const selectLoginMessage = (state: RootState) => state.user.loginMessage;
export const selectUserId = (state: RootState) => state.user.uid;
