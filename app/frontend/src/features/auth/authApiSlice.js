import splitApiSlice from '../../app/splitApiSlice';

export const authApiSlice = splitApiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      registerUser: builder.mutation({
        query: (data) => ({
          url: '/auth/register',
          method: 'POST',
          body: data,
        }),
      }),
      activateUser: builder.mutation({
        query: (data) => ({
          url: '/auth/activate',
          method: 'POST',
          body: data,
        }),
      }),
      requestNewPassword: builder.mutation({
        query: (data) => ({
          url: '/auth/password-reset/',
          method: 'POST',
          body: data,
        }),
      }),
      changeNewPassword: builder.mutation({
        query: (data) => ({
          url: '/auth/password-reset/confirm/',
          method: 'POST',
          body: data,
        }),
      }),
      loginUser: builder.mutation({
        query: (data) => ({
          url: '/auth/login',
          method: 'POST',
          body: data,
        }),
      }),
      logoutUser: builder.mutation({
        query: (data) => ({
          url: '/auth/logout',
          method: 'POST',
          body: data,
          responseHandler: 'text',
        }),
      }),
      fetchUserByToken: builder.query({
        query: (data) => ({
          url: '/auth/user',
          method: 'GET',
          body: data,
        }),
      }),
    };
  },
});

export const {
  useRegisterUserMutation,
  useActivateUserMutation,
  useRequestNewPasswordMutation,
  useChangeNewPasswordMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useFetchUserByTokenQuery,
} = authApiSlice;
