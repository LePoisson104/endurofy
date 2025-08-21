import { apiSlice } from "../api-slice";

export const foodLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoodLog: builder.query({
      query: ({ userId, date }) => ({
        url: `/api/v1/food-logs/${userId}/date/${date}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, date }) => [
        { type: "FoodLog", id: `${userId}/${date}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    getFoddLogsDate: builder.query({
      query: ({ userId, startDate, endDate }) => ({
        url: `/api/v1/food-logs/${userId}/dates/${startDate}/${endDate}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, startDate, endDate }) => [
        { type: "FoodLog", id: `${userId}/${startDate}/${endDate}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    addFoodLog: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/food-logs/${userId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
    deleteFoodLog: builder.mutation({
      query: ({ foodId, foodLogId }) => ({
        url: `/api/v1/food-logs/food/${foodId}/${foodLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
    updateFoodLog: builder.mutation({
      query: ({ foodId, payload }) => ({
        url: `/api/v1/food-logs/food/${foodId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
  }),
});

export const {
  useAddFoodLogMutation,
  useGetFoodLogQuery,
  useDeleteFoodLogMutation,
  useUpdateFoodLogMutation,
  useGetFoddLogsDateQuery,
} = foodLogApiSlice;
