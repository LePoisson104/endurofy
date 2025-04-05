import { apiSlice } from "../api-slice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWeightLogByDate: builder.query({
      query: ({ userId, startDate, endDate }) => ({
        url: `/api/v1/weight-log/get-weight-log-by-date/${userId}?startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) =>
        result ? [{ type: "WeightLog", id: userId }] : [],
    }),
  }),
});

export const { useGetWeightLogByDateQuery } = usersApiSlice;
