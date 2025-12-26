import { apiSlice } from "../api-slice";

export const foodLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoodLog: builder.query({
      query: ({ date }: { date: string }) => ({
        url: `/api/v1/food-logs/${date}`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        { userId, date }: { userId: string; date: string }
      ) => [
        { type: "FoodLog", id: `${userId}/${date}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    getFoddLogsDate: builder.query({
      query: ({
        startDate,
        endDate,
      }: {
        startDate: string;
        endDate: string;
      }) => ({
        url: `/api/v1/food-logs/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        {
          userId,
          startDate,
          endDate,
        }: { userId: string; startDate: string; endDate: string }
      ) => [
        { type: "FoodLog", id: `${userId}/${startDate}/${endDate}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    addFoodLog: builder.mutation({
      query: ({ payload }) => ({
        url: `/api/v1/food-logs`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "FoodLog", id: "LIST" },
        { type: "Food", id: "LIST" },
      ],
    }),
    updateFoodLog: builder.mutation({
      query: ({ foodLogId, foodId, payload }) => ({
        url: `/api/v1/food-logs/food/${foodLogId}/${foodId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
    markDayComplete: builder.mutation({
      query: ({ foodLogId, payload }) => ({
        url: `/api/v1/food-logs/mark-as-complete/${foodLogId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [
        { type: "FoodLog", id: "LIST" },
        { type: "WeightLog", id: "LIST" },
      ],
    }),
    markDayAsIncomplete: builder.mutation({
      query: ({ foodLogId }) => ({
        url: `/api/v1/food-logs/mark-as-incomplete/${foodLogId}`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
    removeFood: builder.mutation({
      query: ({ foodId, foodLogId }) => ({
        url: `/api/v1/food-logs/food/${foodId}/${foodLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "FoodLog", id: "LIST" },
        { type: "Food", id: "LIST" },
      ],
    }),
    deleteFoodLog: builder.mutation({
      query: ({ foodLogId }) => ({
        url: `/api/v1/food-logs/food-log/${foodLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "FoodLog", id: "LIST" },
        { type: "WaterLog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useAddFoodLogMutation,
  useGetFoodLogQuery,
  useRemoveFoodMutation,
  useUpdateFoodLogMutation,
  useGetFoddLogsDateQuery,
  useDeleteFoodLogMutation,
  useMarkDayCompleteMutation,
  useMarkDayAsIncompleteMutation,
} = foodLogApiSlice;
