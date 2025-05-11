import { apiSlice } from "../api-slice";

export const workoutProgramApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutProgram: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/workout-program/get-workout-program/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "WorkoutProgram", id: `${arg.userId}` },
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
    updateWorkoutProgramDescription: builder.mutation({
      query: ({ userId, programId, payload }) => ({
        url: `/api/v1/workout-program/update-workout-program-description/${userId}/${programId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    updateWorkoutProgramDay: builder.mutation({
      query: ({ programId, dayId, payload }) => ({
        url: `/api/v1/workout-program/update-workout-program-day/${programId}/${dayId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    updateWorkoutProgramExercise: builder.mutation({
      query: ({ dayId, exerciseId, programId, payload }) => ({
        url: `/api/v1/workout-program/update-workout-program-exercise/${programId}/${dayId}/${exerciseId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgram: builder.mutation({
      query: ({ userId, programId }) => ({
        url: `/api/v1/workout-program/delete-workout-program/${userId}/${programId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgramDay: builder.mutation({
      query: ({ programId, dayId }) => ({
        url: `/api/v1/workout-program/delete-workout-program-day/${programId}/${dayId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgramExercise: builder.mutation({
      query: ({ programId, dayId, exerciseId }) => ({
        url: `/api/v1/workout-program/delete-workout-program-exercise/${programId}/${dayId}/${exerciseId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWorkoutProgramQuery,
  useCreateWorkoutProgramMutation,
  useDeleteWorkoutProgramMutation,
  useDeleteWorkoutProgramDayMutation,
  useDeleteWorkoutProgramExerciseMutation,
  useUpdateWorkoutProgramDescriptionMutation,
  useUpdateWorkoutProgramDayMutation,
  useUpdateWorkoutProgramExerciseMutation,
} = workoutProgramApiSlice;
