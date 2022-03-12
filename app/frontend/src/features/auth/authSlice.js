import { createSlice, isAnyOf, isRejected } from '@reduxjs/toolkit';

import { authApiSlice } from './authApiSlice';

const initialState = {
  user: null,
  // Keep the user logged in on page refresh
  token:
    localStorage.getItem('token') !== 'null'
      ? localStorage.getItem('token')
      : null,
  isAuthenticated: true, // This stops the user always being redirected to login
  isFetching: false,
};

const sliceName = 'auth';

// AUTH SLICE
const authSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          authApiSlice.endpoints.loginUser.matchFulfilled,
          authApiSlice.endpoints.fetchUserByToken.matchFulfilled,
        ),
        (state, action) => {
          state.isFetching = false;
          state.isAuthenticated = true;
          if (action.payload.token && action.payload.token !== 'null') {
            state.token = action.payload.token;
            // Keep the user logged in on page refresh
            localStorage.setItem('token', action.payload.token);
          }
          if (action.payload.user) {
            state.user = action.payload.user;
          } else {
            // fetchUserByToken doesn't return the token
            state.user = action.payload;
          }
        },
      )
      .addMatcher(
        isAnyOf(authApiSlice.endpoints.registerUser.matchFulfilled),
        (state, action) => {
          state.isFetching = false;
          state.user = action.payload.user;
          state.token = null;
          localStorage.setItem('token', null);
          state.isAuthenticated = false;
        },
      )
      .addMatcher(
        isAnyOf(authApiSlice.endpoints.logoutUser.matchFulfilled),
        (state) => {
          state.isFetching = false;
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.setItem('token', null);
        },
      )
      .addMatcher(
        isAnyOf(
          authApiSlice.endpoints.activateUser.matchFulfilled,
          authApiSlice.endpoints.requestNewPassword.matchFulfilled,
          authApiSlice.endpoints.changeNewPassword.matchFulfilled,
        ),
        (state) => {
          state.isFetching = false;
        },
      )
      .addMatcher(
        isAnyOf(
          authApiSlice.endpoints.loginUser.matchPending,
          authApiSlice.endpoints.activateUser.matchPending,
          authApiSlice.endpoints.registerUser.matchPending,
          authApiSlice.endpoints.logoutUser.matchPending,
          authApiSlice.endpoints.fetchUserByToken.matchPending,
          authApiSlice.endpoints.requestNewPassword.matchPending,
          authApiSlice.endpoints.changeNewPassword.matchPending,
        ),
        (state) => {
          state.isFetching = true;
        },
      )
      .addMatcher(isRejected, (state, action) => {
        state.isFetching = false;
        if (action.payload?.status === 401) {
          localStorage.setItem('token', null);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export default authSlice.reducer;
export const authSelector = (state) => state[sliceName];
