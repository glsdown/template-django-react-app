import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const sliceName = 'messages';

// MESSAGE SLICE
const messageSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    createMessage(state, { payload }) {
      if (payload) {
        const { alertType, msg } = payload;
        return { alertType, msg };
      } else {
        return { alertType: 'error', msg: 'An unknown error occurred' };
      }
    },
  },
});

export const messageSelector = (state) => state[sliceName];
export const { createMessage } = messageSlice.actions;
export default messageSlice.reducer;
