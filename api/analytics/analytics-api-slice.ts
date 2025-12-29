import { apiSlice } from "../api-slice";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    workoutLogsAnalytics: builder.query({
      query: ({ userId, programId, programDayId, startDate, endDate }) => ({
        url: `/api/v1/analytics/workouts/${programId}/${programDayId}/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "Analytics",
          id: `${arg.programId}/${arg.programDayId}/${arg.startDate}/${arg.endDate}`,
        },
        { type: "Analytics", id: "LIST" },
      ],
    }),
    macrosNutrientsAnalytics: builder.query({
      query: ({ startDate, endDate }) => ({
        url: `/api/v1/analytics/macrosnutrients/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "Analytics", id: `${arg.startDate}/${arg.endDate}` },
        { type: "Analytics", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useWorkoutLogsAnalyticsQuery,
  useMacrosNutrientsAnalyticsQuery,
} = analyticsApiSlice;
