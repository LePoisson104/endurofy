import { apiSlice } from "../api-slice";

export const workoutProgramApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutProgram: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/workout-program/get-workout-program/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "WorkoutProgram", id: `${userId}` },
        { type: "WorkoutProgram", id: "LIST" },
      ],
    }),
    createWorkoutProgram: builder.mutation({
      query: ({ userId, workoutProgram }) => ({
        url: `/api/v1/workout-program/create-workout-program/${userId}`,
        method: "POST",
        body: workoutProgram,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
  }),
});

export const { useGetWorkoutProgramQuery, useCreateWorkoutProgramMutation } =
  workoutProgramApiSlice;
