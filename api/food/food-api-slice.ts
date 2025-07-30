import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFood: builder.query({
      query: ({ searchItem }) => ({
        url: `/api/v1/food/search/${searchItem}`,
        method: "GET",
      }),
    }),
    getCustomFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/food/${userId}/custom`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    addCustomFood: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/food/${userId}/custom`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Food", id: "LIST" }],
    }),
  }),
});

export const {
  useSearchFoodQuery,
  useAddCustomFoodMutation,
  useGetCustomFoodsQuery,
} = foodApiSlice;
