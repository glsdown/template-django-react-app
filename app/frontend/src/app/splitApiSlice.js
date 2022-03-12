import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// initialize an empty api service that we'll inject endpoints into later as needed
const splitApiSlice = createApi({
  reducerPath: 'api',
  tagTypes: ['data', 'auth'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');

      // If token, add to headers config
      const { token } = getState().auth;
      if (token != null && token !== 'null') {
        headers.set('Authorization', `Token ${token}`);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});

export default splitApiSlice;
