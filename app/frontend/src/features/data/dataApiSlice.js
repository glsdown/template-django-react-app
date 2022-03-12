import splitApiSlice from '../../app/splitApiSlice';
import { createMessage } from '../messages/messageSlice';

export const reducerName = 'data';

export const dataApiSlice = splitApiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      // Add an entry via a POST request
      addData: builder.mutation({
        query: (data) => ({
          url: '/examples/',
          method: 'POST',
          body: data,
        }),
        // Invalidate all currently loaded data - force a complete refresh
        invalidatesTags: [{ type: `${reducerName}`, id: 'LIST' }],
        async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
          // Display a message when it's been added
          await cacheDataLoaded;
          dispatch(
            createMessage({
              msg: 'Entry Added',
              alertType: 'success',
            })
          );
        },
      }),
      // Delete an entry via a DELETE request
      deleteData: builder.mutation({
        query: (id) => ({
          url: `/examples/${id}`,
          method: 'DELETE',
        }),
        // Invalidate the entry relating to that ID
        invalidatesTags: (result, error, { id }) => [
          { type: `${reducerName}`, id },
        ],
        async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
          // Display a message when it's been deleted
          await cacheDataLoaded;
          dispatch(
            createMessage({
              msg: 'Entry Deleted',
              alertType: 'success',
            })
          );
        },
      }),
      // (Partially) update an entry via a PATCH request
      // Using PUT would update the entire entry
      updateData: builder.mutation({
        query: (data) => {
          const { id, ...body } = data;
          return {
            url: `/examples/${id}/`,
            method: 'PATCH',
            body,
          };
        },
        // Invalidate the entry relating to that ID
        invalidatesTags: (result, error, { id }) => [
          { type: `${reducerName}`, id },
        ],
        // Update the details for that single item in the store
        async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            splitApiSlice.util.updateQueryData('getDataPoint', id, (draft) => {
              Object.assign(draft, patch);
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
        async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
          // Display a message when successfully updated
          await cacheDataLoaded;
          dispatch(
            createMessage({
              msg: 'Entry Updated',
              alertType: 'success',
            })
          );
        },
      }),
      // Get all the entries from the API (paginated) using a GET request
      getData: builder.query({
        query: ({ limit = 10, page = 1 }) => ({
          url: `/examples/?limit=${limit}&page=${page}`,
        }),
        // Tag all the entries with the ID
        providesTags: (result) => {
          if (result && result.results) {
            return [
              ...result.results.map(({ id }) => ({
                type: `${reducerName}`,
                id,
              })),
              { type: `${reducerName}`, id: 'LIST' },
            ];
          }
          return [{ type: `${reducerName}`, id: 'LIST' }];
        },
      }),
      // Get a single entry using a GET request
      getDataPoint: builder.query({
        query: (id) => `/examples/${id}/`,
        // Tag it with the right ID
        providesTags: (result, error, id) => [{ type: `${reducerName}`, id }],
      }),
    };
  },
  // Don't override existing endpoints in the slice
  overrideExisting: false,
});

// Export the required hooks
export const {
  useGetDataQuery,
  useAddDataMutation,
  useDeleteDataMutation,
  useUpdateDataMutation,
} = dataApiSlice;
