import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoodLog: builder.query({
      query: ({ userId, date }) => ({
        url: `/api/v1/food-log/${userId}/date/${date}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, date }) => [
        { type: "FoodLog", id: `${userId}/${date}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    addFoodLog: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/food-log/${userId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
    deleteFoodLog: builder.mutation({
      query: ({ foodLogId }) => ({
        url: `/api/v1/food-log/food/${foodLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
  }),
});

export const {
  useAddFoodLogMutation,
  useGetFoodLogQuery,
  useDeleteFoodLogMutation,
} = foodApiSlice;
