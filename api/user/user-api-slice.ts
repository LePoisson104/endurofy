import { apiSlice } from "../api-slice";

interface deleteAccountRequest {
  user_id: string;
  email: string;
  password: string;
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsersInfo: builder.query({
      query: (userId) => ({
        url: `/api/v1/users/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) =>
        result ? [{ type: "User", id: userId }] : [],
    }),
    updateUsersName: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-name/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    updateUsersProfile: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-profile/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    updateUsersEmail: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-email/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    updateUsersPassword: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-password/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    deleteUsersAccount: builder.mutation<void, deleteAccountRequest>({
      query: ({ user_id, email, password }) => ({
        url: `/api/v1/users/delete-account/${user_id}`,
        method: "DELETE",
        body: { email, password },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.user_id },
      ],
    }),
  }),
});

export const {
  useGetAllUsersInfoQuery,
  useUpdateUsersNameMutation,
  useUpdateUsersProfileMutation,
  useUpdateUsersEmailMutation,
  useUpdateUsersPasswordMutation,
  useDeleteUsersAccountMutation,
} = usersApiSlice;
