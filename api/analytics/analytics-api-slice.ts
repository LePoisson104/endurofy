import { apiSlice } from "../api-slice";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConsistency: builder.query({
      query: ({ startDate, endDate }) => ({
        url: `/api/v1/analytics/consistency/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "Analytics",
          id: `consistency-${arg.startDate}-${arg.endDate}`,
        },
        { type: "Analytics", id: "LIST" },
        { type: "WeightLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
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
        { type: "WeightLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
        { type: "WorkoutLog", id: "LIST" },
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
        { type: "WeightLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useWorkoutLogsAnalyticsQuery,
  useMacrosNutrientsAnalyticsQuery,
  useGetConsistencyQuery,
} = analyticsApiSlice;
