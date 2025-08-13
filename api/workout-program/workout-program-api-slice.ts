import { apiSlice } from "../api-slice";

export const workoutProgramApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutProgram: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/workout-programs/get-workout-program/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "WorkoutProgram", id: `${arg.userId}` },
        { type: "WorkoutProgram", id: "LIST" },
      ],
    }),
    createWorkoutProgram: builder.mutation({
      query: ({ userId, workoutProgram }) => ({
        url: `/api/v1/workout-programs/create-workout-program/${userId}`,
        method: "POST",
        body: workoutProgram,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    createManualWorkoutExercise: builder.mutation({
      query: ({ dayId, payload }) => ({
        url: `/api/v1/workout-programs/create-manual-workout-exercise/${dayId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    addExercise: builder.mutation({
      query: ({ programId, dayId, payload }) => ({
        url: `/api/v1/workout-programs/add-exercise/${programId}/${dayId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    addProgramDay: builder.mutation({
      query: ({ programId, payload }) => ({
        url: `/api/v1/workout-programs/add-program-day/${programId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    updateWorkoutProgramDescription: builder.mutation({
      query: ({ userId, programId, payload }) => ({
        url: `/api/v1/workout-programs/update-workout-program-description/${userId}/${programId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    updateWorkoutProgramDay: builder.mutation({
      query: ({ programId, dayId, payload }) => ({
        url: `/api/v1/workout-programs/update-workout-program-day/${programId}/${dayId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    updateWorkoutProgramExercise: builder.mutation({
      query: ({ dayId, exerciseId, programId, payload }) => ({
        url: `/api/v1/workout-programs/update-workout-program-exercise/${programId}/${dayId}/${exerciseId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    reorderWorkoutProgramExercise: builder.mutation({
      query: ({ programId, dayId, payload }) => ({
        url: `/api/v1/workout-programs/reorder-exercise-order/${programId}/${dayId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    setProgramAsInactive: builder.mutation({
      query: ({ programId, userId }) => ({
        url: `/api/v1/workout-programs/set-program-as-inactive/${userId}/${programId}`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    setProgramAsActive: builder.mutation({
      query: ({ programId, userId }) => ({
        url: `/api/v1/workout-programs/set-program-as-active/${userId}/${programId}`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgram: builder.mutation({
      query: ({ userId, programId }) => ({
        url: `/api/v1/workout-programs/delete-workout-program/${userId}/${programId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgramDay: builder.mutation({
      query: ({ programId, dayId }) => ({
        url: `/api/v1/workout-programs/delete-workout-program-day/${programId}/${dayId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutProgram", id: "LIST" }],
    }),
    deleteWorkoutProgramExercise: builder.mutation({
      query: ({ programId, dayId, exerciseId }) => ({
        url: `/api/v1/workout-programs/delete-workout-program-exercise/${programId}/${dayId}/${exerciseId}`,
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
  useCreateManualWorkoutExerciseMutation,
  useDeleteWorkoutProgramExerciseMutation,
  useUpdateWorkoutProgramDescriptionMutation,
  useUpdateWorkoutProgramDayMutation,
  useUpdateWorkoutProgramExerciseMutation,
  useAddExerciseMutation,
  useAddProgramDayMutation,
  useReorderWorkoutProgramExerciseMutation,
  useSetProgramAsInactiveMutation,
  useSetProgramAsActiveMutation,
} = workoutProgramApiSlice;
