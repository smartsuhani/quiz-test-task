import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {firebase} from '@react-native-firebase/database';

// Define the type for User Points
type UserPointsState = {
  points: Record<string, number>; // Assuming points are stored as { userId: points }
  loading: boolean;
  error: string | null;
};

// Initial state
const initialState: UserPointsState = {
  points: {},
  loading: false,
  error: null,
};

// Async thunk to initialize real-time listener
export const initializeUserPointsListener = createAsyncThunk<
  void,
  void,
  {rejectValue: string}
>(
  'userPoints/initializeUserPointsListener',
  async (_, {rejectWithValue, dispatch}) => {
    try {
      const userPointsRef = firebase.database().ref('userPoints/');

      // Set up the listener
      userPointsRef.on('value', snapshot => {
        const pointsData = snapshot.val() || {};
        dispatch(userPointsSlice.actions.updateUserPoints(pointsData));
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Create the slice
const userPointsSlice = createSlice({
  name: 'userPoints',
  initialState,
  reducers: {
    updateUserPoints: (state, action) => {
      state.points = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(
        initializeUserPointsListener.pending,
        (state: UserPointsState) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        initializeUserPointsListener.fulfilled,
        (state: UserPointsState) => {
          state.loading = false;
        },
      )
      .addCase(
        initializeUserPointsListener.rejected,
        (state: UserPointsState, action) => {
          state.loading = false;
          state.error =
            action.payload || 'Failed to initialize user points listener';
        },
      );
  },
});

// Export the reducer and actions
export default userPointsSlice.reducer;
export const {updateUserPoints} = userPointsSlice.actions;

// Export the async thunk for use in components
export {initializeUserPointsListener};
