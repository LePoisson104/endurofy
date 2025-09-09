import { apiSlice } from "../api-slice";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";

interface deleteAccountRequest {
  user_id: string;
  email: string;
  password: string;
}

interface updateEmailRequest {
  userId: string;
  email: string;
  newEmail: string;
  password: string;
}

interface verifyUpdateEmailRequest {
  userId: string;
  otp: string;
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsersInfo: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/users/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) =>
        result ? [{ type: "User", id: arg.userId }] : [],
    }),
    getUsersMacrosGoals: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/users/macros-goals/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
    }),
    updateUsersMacrosGoals: builder.mutation({
      query: ({ userId, updateMacrosGoalsPayload }) => ({
        url: `/api/v1/users/macros-goals/${userId}`,
        method: "PATCH",
        body: updateMacrosGoalsPayload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId },
      ],
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
    updateUsersProfile: builder.mutation<
      void,
      { userId: string; payload: UpdateUserInfo }
    >({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-profile/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    updateUsersAndConvertWeightLogs: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/users/update-profile-and-convert-weight-logs/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "WeightLog", id: arg.userId }, // Ensure you pass userId correctly
        { type: "WeightLog", id: "LIST" },
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    updateUsersEmail: builder.mutation<void, updateEmailRequest>({
      query: ({ userId, email, newEmail, password }) => ({
        url: `/api/v1/users/update-email/${userId}`,
        method: "PATCH",
        body: { email, newEmail, password },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    verifyUpdateEmail: builder.mutation<void, verifyUpdateEmailRequest>({
      query: ({ userId, otp }) => ({
        url: `/api/v1/users/verify-update-email/${userId}`,
        method: "POST",
        body: { otp },
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
  useGetUsersMacrosGoalsQuery,
  useUpdateUsersMacrosGoalsMutation,
  useUpdateUsersNameMutation,
  useUpdateUsersProfileMutation,
  useUpdateUsersEmailMutation,
  useVerifyUpdateEmailMutation,
  useUpdateUsersPasswordMutation,
  useDeleteUsersAccountMutation,
  useUpdateUsersAndConvertWeightLogsMutation,
} = usersApiSlice;
