import { apiSlice } from "../api-slice";

export const workoutProgressionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPersonalRecord: builder.query({
      query: ({ userId, programId, exerciseId }) => ({
        url: `/api/v1/workout-progressions/personal-record/${userId}/${programId}/${exerciseId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "WorkoutProgression", id: `${arg.userId}` },
        { type: "WorkoutProgression", id: "LIST" },
      ],
    }),
    getWorkoutProgression: builder.query({
      query: ({ userId, programId, exerciseId, startDate, endDate }) => ({
        url: `/api/v1/workout-progressions/analytics/${userId}/${programId}/${exerciseId}/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "WorkoutProgression", id: `${arg.userId}` },
        { type: "WorkoutProgression", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetPersonalRecordQuery, useGetWorkoutProgressionQuery } =
  workoutProgressionApiSlice;
