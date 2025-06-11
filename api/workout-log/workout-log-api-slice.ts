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
    createWorkoutLog: builder.mutation({
      query: ({
        userId,
        programId,
        workoutLog,
      }: {
        userId: string;
        programId: string;
        workoutLog: WorkoutLogPayload;
      }) => ({
        url: `/api/v1/workout-log/create-workout-log/${userId}/${programId}`,
        method: "POST",
        body: workoutLog,
      }),
      invalidatesTags: [{ type: "WorkoutLog", id: "LIST" }],
    }),
  }),
});

export const { useGetWorkoutLogQuery, useCreateWorkoutLogMutation } =
  workoutLogApiSlice;
