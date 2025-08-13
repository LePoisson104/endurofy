import { apiSlice } from "../api-slice";
import { WorkoutLogPayload } from "@/interfaces/workout-log-interfaces";

export const workoutLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutLog: builder.query({
      query: ({ userId, programId, startDate, endDate }) => ({
        url: `/api/v1/workout-logs/get-workout-log/${userId}/${programId}/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.startDate}-${arg.endDate}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    getManualWorkoutLogWithPrevious: builder.query({
      query: ({ userId, programId, workoutDate }) => ({
        url: `/api/v1/workout-logs/get-manual-workout-log-with-previous/${userId}/${programId}/${workoutDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.workoutDate}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    getWokroutLogPagination: builder.query({
      query: ({ userId, programId, offset, limit }) => ({
        url: `/api/v1/workout-logs/get-workout-log-pagination/${userId}/${programId}/${offset}/${limit}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.offset}-${arg.limit}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    getPreviousWorkoutLog: builder.query({
      query: ({ userId, programId, dayId, currentWorkoutDate }) => ({
        url: `/api/v1/workout-logs/get-previous-workout-log/${userId}/${programId}/${dayId}/${currentWorkoutDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.dayId}-${arg.currentWorkoutDate}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    getCompletedWorkoutLogs: builder.query({
      query: ({ userId, programId, startDate, endDate }) => ({
        url: `/api/v1/workout-logs/get-completed-workout-logs/${userId}/${programId}/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.startDate}-${arg.endDate}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    getWorkoutLogDates: builder.query({
      query: ({ userId, programId, startDate, endDate }) => ({
        url: `/api/v1/workout-logs/get-workout-log-dates/${userId}/${programId}/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        {
          type: "WorkoutLog",
          id: `${arg.userId}-${arg.programId}-${arg.startDate}-${arg.endDate}`,
        },
        { type: "WorkoutLog", id: "LIST" },
      ],
    }),
    createManualWorkoutLog: builder.mutation({
      query: ({ userId, programId, dayId, payload }) => ({
        url: `/api/v1/workout-logs/create-manual-workout-log/${userId}/${programId}/${dayId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    addManualWorkoutExercise: builder.mutation({
      query: ({ workoutLogId, programExerciseId, payload }) => ({
        url: `/api/v1/workout-logs/add-manual-workout-exercise/${workoutLogId}/${programExerciseId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    addWorkoutSet: builder.mutation({
      query: ({ workoutExerciseId, payload }) => ({
        url: `/api/v1/workout-logs/add-workout-set/${workoutExerciseId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    createWorkoutLog: builder.mutation({
      query: ({
        userId,
        programId,
        dayId,
        workoutLog,
      }: {
        userId: string;
        programId: string;
        dayId: string;
        workoutLog: WorkoutLogPayload;
      }) => ({
        url: `/api/v1/workout-logs/create-workout-log/${userId}/${programId}/${dayId}`,
        method: "POST",
        body: workoutLog,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateWorkoutLogStatus: builder.mutation({
      query: ({ workoutLogId, status }) => ({
        url: `/api/v1/workout-logs/update-workout-log-status/${workoutLogId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateWorkoutLogName: builder.mutation({
      query: ({ workoutLogId, title }) => ({
        url: `/api/v1/workout-logs/update-workout-log-name/${workoutLogId}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateExerciseNotes: builder.mutation({
      query: ({ workoutExerciseId, exerciseNotes }) => ({
        url: `/api/v1/workout-logs/update-exercise-notes/${workoutExerciseId}`,
        method: "PATCH",
        body: { exerciseNotes },
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateWorkoutSet: builder.mutation({
      query: ({ workoutSetId, workoutExerciseId, workoutSetPayload }) => ({
        url: `/api/v1/workout-logs/update-workout-set/${workoutSetId}/${workoutExerciseId}`,
        method: "PATCH",
        body: workoutSetPayload,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    deleteWorkoutSetWithCascade: builder.mutation({
      query: ({ workoutSetId, workoutExerciseId, workoutLogId }) => ({
        url: `/api/v1/workout-logs/delete-workout-set-with-cascade/${workoutSetId}/${workoutExerciseId}/${workoutLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    deleteWorkoutLog: builder.mutation({
      query: ({ workoutLogId }) => ({
        url: `/api/v1/workout-logs/delete-workout-log/${workoutLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    deleteWorkoutExercise: builder.mutation({
      query: ({ workoutExerciseId, workoutLogId, workoutLogType }) => ({
        url: `/api/v1/workout-logs/delete-workout-exercise/${workoutExerciseId}/${workoutLogId}/${workoutLogType}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    deleteWorkoutSet: builder.mutation({
      query: ({ workoutSetId }) => ({
        url: `/api/v1/workout-logs/delete-workout-set/${workoutSetId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWorkoutLogQuery,
  useGetWorkoutLogDatesQuery,
  useCreateWorkoutLogMutation,
  useDeleteWorkoutSetMutation,
  useUpdateExerciseNotesMutation,
  useUpdateWorkoutSetMutation,
  useUpdateWorkoutLogStatusMutation,
  useGetCompletedWorkoutLogsQuery,
  useGetPreviousWorkoutLogQuery,
  useGetWokroutLogPaginationQuery,
  useUpdateWorkoutLogNameMutation,
  useCreateManualWorkoutLogMutation,
  useAddManualWorkoutExerciseMutation,
  useAddWorkoutSetMutation,
  useDeleteWorkoutLogMutation,
  useDeleteWorkoutExerciseMutation,
  useDeleteWorkoutSetWithCascadeMutation,
  useGetManualWorkoutLogWithPreviousQuery,
} = workoutLogApiSlice;
