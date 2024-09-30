import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import auth from '@react-native-firebase/auth';
import {firebase} from '@react-native-firebase/database';

interface UserProfileState {
  fullName: string;
  userNames: Record<string, string>; // Added property to store user names
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  fullName: '',
  userNames: {},
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

    const userRef = firebase.database().ref(`/Userdata/${user.uid}`);
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

    const userRef = firebase.database().ref(`/Userdata/${user.uid}`);
    await userRef.update({fullName: newFullName});
    return newFullName;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Thunk to fetch all user names from Firebase Realtime Database
export const fetchUserNames = createAsyncThunk<
  Record<string, string>,
  void,
  {rejectValue: string}
>('userProfile/fetchUserNames', async (_, {rejectWithValue, dispatch}) => {
  try {
    const userRef = firebase.database().ref('/Userdata');

    // Fetch initial data using `once`
    const snapshot = await userRef.once('value');
    const userNames: Record<string, string> = {};

    if (!snapshot.exists()) {
      throw new Error('No user data found');
    }

    const data = snapshot.val();
    // Populate userNames object with userId and fullName
    for (const userId in data) {
      userNames[userId] = data[userId].fullName;
    }

    // Dispatch action to update userNames with the initial fetched data
    dispatch(updateUserNames(userNames));

    // Set up listener with `on` to listen for future changes
    userRef.on('value', snapshot => {
      const updatedData = snapshot.val();
      const updatedUserNames: Record<string, string> = {};

      if (updatedData) {
        for (const userId in updatedData) {
          updatedUserNames[userId] = updatedData[userId].fullName;
        }
        // Dispatch the updated user names
        dispatch(updateUserNames(updatedUserNames));
      }
    });

    return userNames; // Return the initial user names
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const updateUserNames = (userNames: Record<string, string>) => ({
  type: 'userProfile/updateUserNames',
  payload: userNames,
});

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
    clearUserProfile: state => {
      // Reset the state to the initial values
      state.fullName = '';
      state.userNames = {}; // Reset the userNames as well
      state.loading = false;
      state.error = null;
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
      })
      .addCase(fetchUserNames.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserNames.fulfilled,
        (state, action: PayloadAction<Record<string, string>>) => {
          console.log(action.payload, 'ddddd');
          state.loading = false;
          state.userNames = action.payload;
        },
      )
      .addCase(fetchUserNames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export the new clear state action
export const {setFullName, clearUserProfile} = userProfileSlice.actions;

export const selectFullName = (state: RootState) => state.userProfile.fullName;
export const selectUserNames = (state: RootState) =>
  state.userProfile.userNames;
export const selectUserProfileLoading = (state: RootState) =>
  state.userProfile.loading;
export const selectUserProfileError = (state: RootState) =>
  state.userProfile.error;

export default userProfileSlice.reducer;

export {fetchFullName, updateFullName, fetchUserNames};
