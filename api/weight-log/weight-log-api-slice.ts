import { apiSlice } from "../api-slice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWeightLogByDate: builder.query({
      query: ({ userId, startDate, endDate }) => ({
        url: `/api/v1/weight-log/get-weight-log-by-date/${userId}?startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, startDate, endDate }) => [
        { type: "WeightLog", id: `${userId}-${startDate}-${endDate}` },
        { type: "WeightLog", id: "LIST" },
      ],
    }),
    createWeightLog: builder.mutation({
      query: ({ userId, weightLogPayload }) => ({
        url: `/api/v1/weight-log/create-weight-log/${userId}`,
        method: "POST",
        body: weightLogPayload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "WeightLog", id: arg.userId }, // Ensure you pass userId correctly
        { type: "WeightLog", id: "LIST" },
        { type: "User", id: arg.userId }, // Ensure you pass userId correctly
      ],
    }),
    deleteWeightLog: builder.mutation({
      query: ({ userId, weightLogId }) => ({
        url: `/api/v1/weight-log/delete-weight-log/${userId}/${weightLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "WeightLog", id: arg.userId }, // Ensure you pass userId correctly
        { type: "WeightLog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWeightLogByDateQuery,
  useCreateWeightLogMutation,
  useDeleteWeightLogMutation,
} = usersApiSlice;
