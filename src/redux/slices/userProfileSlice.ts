import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

interface UserProfileState {
  fullName: string;
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  fullName: '',
  loading: false,
  error: null,
};

// Thunk to fetch full name from Firebase Realtime Database
export const fetchFullName = createAsyncThunk<
  string,
  void,
  {rejectValue: string}
>('userProfile/fetchFullName', async (_, {rejectWithValue}) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not logged in');
    }

    const userRef = database().ref(`/Userdata/${user.uid}`);
    const snapshot = await userRef.once('value');
    if (!snapshot.exists()) {
      throw new Error('User data not found');
    }

    return snapshot.val().fullName;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Thunk to update full name in Firebase Realtime Database
export const updateFullName = createAsyncThunk<
  string,
  string,
  {rejectValue: string}
>('userProfile/updateFullName', async (newFullName, {rejectWithValue}) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not logged in');
    }

    const userRef = database().ref(`/Userdata/${user.uid}`);
    await userRef.update({fullName: newFullName});
    return newFullName;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFullName.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFullName.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.fullName = action.payload;
        },
      )
      .addCase(fetchFullName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFullName.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateFullName.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.fullName = action.payload;
        },
      )
      .addCase(updateFullName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {setFullName} = userProfileSlice.actions;

export const selectFullName = (state: RootState) => state.userProfile.fullName;
export const selectUserProfileLoading = (state: RootState) =>
  state.userProfile.loading;
export const selectUserProfileError = (state: RootState) =>
  state.userProfile.error;

export default userProfileSlice.reducer;
