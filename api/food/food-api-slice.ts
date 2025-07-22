import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFood: builder.query({
      query: ({ searchItem }) => ({
        url: `/api/v1/food/search/${searchItem}`,
        method: "GET",
      }),
      providesTags: (result, error, { searchItem }) => [
        { type: "Food", id: `${searchItem}` },
        { type: "Food", id: "LIST" },
      ],
    }),
  }),
});

export const { useSearchFoodQuery } = foodApiSlice;
