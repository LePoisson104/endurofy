import { apiSlice } from "../api-slice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWeightLogByDate: builder.query({
      query: ({ userId, startDate, endDate, options, withRates }) => ({
        url: `/api/v1/weight-log/get-weight-log-by-date/${userId}?startDate=${startDate}&endDate=${endDate}&options=${options}&withRates=${withRates}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, startDate, endDate }) => [
        { type: "WeightLog", id: `${userId}-${startDate}-${endDate}` },
        { type: "WeightLog", id: "LIST" },
      ],
    }),
    getWeeklyWeightDifference: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/weight-log/get-weekly-weight-difference/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "WeightLog", id: `${userId}-weekly-weight-difference` },
        { type: "WeightLog", id: "LIST" },
      ],
    }),
    getWeightLogDates: builder.query({
      query: ({ userId, startDate, endDate }) => ({
        url: `/api/v1/weight-log/get-weight-log-dates-by-range/${userId}?startDate=${startDate}&endDate=${endDate}`,
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
    updateWeightLog: builder.mutation({
      query: ({ userId, weightLogId, weightLogPayload }) => ({
        url: `/api/v1/weight-log/update-weight-log/${userId}/${weightLogId}`,
        method: "PATCH",
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
  useUpdateWeightLogMutation,
  useDeleteWeightLogMutation,
  useGetWeeklyWeightDifferenceQuery,
  useGetWeightLogDatesQuery,
} = usersApiSlice;
