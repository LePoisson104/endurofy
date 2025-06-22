import { apiSlice } from "../api-slice";
import { WorkoutLogPayload } from "@/interfaces/workout-log-interfaces";

export const workoutLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutLog: builder.query({
      query: ({ userId, programId, startDate, endDate }) => ({
        url: `/api/v1/workout-log/get-workout-log/${userId}/${programId}/${startDate}/${endDate}`,
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
    getWokroutLogPagination: builder.query({
      query: ({ userId, programId, offset, limit }) => ({
        url: `/api/v1/workout-log/get-workout-log-pagination/${userId}/${programId}/${offset}/${limit}`,
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
        url: `/api/v1/workout-log/get-previous-workout-log/${userId}/${programId}/${dayId}/${currentWorkoutDate}`,
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
        url: `/api/v1/workout-log/get-completed-workout-logs/${userId}/${programId}/${startDate}/${endDate}`,
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
        url: `/api/v1/workout-log/get-workout-log-dates/${userId}/${programId}/${startDate}/${endDate}`,
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
        url: `/api/v1/workout-log/create-workout-log/${userId}/${programId}/${dayId}`,
        method: "POST",
        body: workoutLog,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateWorkoutLogStatus: builder.mutation({
      query: ({ workoutLogId, status }) => ({
        url: `/api/v1/workout-log/update-workout-log-status/${workoutLogId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateExerciseNotes: builder.mutation({
      query: ({ workoutExerciseId, exerciseNotes }) => ({
        url: `/api/v1/workout-log/update-exercise-notes/${workoutExerciseId}`,
        method: "PATCH",
        body: { exerciseNotes },
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    updateWorkoutSet: builder.mutation({
      query: ({ workoutSetId, workoutExerciseId, workoutSetPayload }) => ({
        url: `/api/v1/workout-log/update-workout-set/${workoutSetId}/${workoutExerciseId}`,
        method: "PATCH",
        body: workoutSetPayload,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
    deleteWorkoutSet: builder.mutation({
      query: ({ workoutSetId, workoutExerciseId, workoutLogId }) => ({
        url: `/api/v1/workout-log/delete-workout-set/${workoutSetId}/${workoutExerciseId}/${workoutLogId}`,
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
} = workoutLogApiSlice;
