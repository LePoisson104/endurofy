import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addFoodLog: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/food-log/${userId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "FoodLog", id: "LIST" }],
    }),
  }),
});

export const { useAddFoodLogMutation } = foodApiSlice;
