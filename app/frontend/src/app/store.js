import { configureStore } from '@reduxjs/toolkit';

import splitApiSlice from './splitApiSlice';
import authReducer from '../features/auth/authSlice';
import messageReducer from '../features/messages/messageSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    [splitApiSlice.reducerPath]: splitApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(splitApiSlice.middleware),
});

export default store;
