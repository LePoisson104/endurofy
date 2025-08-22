import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFood: builder.query({
      query: ({ userId, searchItem }) => ({
        url: `/api/v1/foods/${userId}/search/${searchItem}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, searchItem }) => [
        { type: "Food", id: `${userId}/${searchItem}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getCustomFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/foods/${userId}/custom`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getFavoriteFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/foods/${userId}/favorites`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    addCustomFood: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/foods/${userId}/custom`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Food", id: "LIST" }],
    }),
    updateCustomFood: builder.mutation({
      query: ({ customFoodId, payload }) => ({
        url: `/api/v1/foods/custom/${customFoodId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: [{ type: "Food", id: "LIST" }],
    }),
    addFavoriteFood: builder.mutation({
      query: ({ userId, payload }: { userId: string; payload: any }) => ({
        url: `/api/v1/foods/${userId}/favorites`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId, payload }) => [
        { type: "Food", id: `${userId}/${payload.foodId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    removeFavoriteFood: builder.mutation({
      query: ({ userId, favFoodId }) => ({
        url: `/api/v1/foods/favorites/${favFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { favFoodId }) => [
        { type: "Food", id: `${favFoodId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    deleteCustomFood: builder.mutation({
      query: ({ userId, customFoodId }) => ({
        url: `/api/v1/foods/${userId}/custom/${customFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Food", id: "LIST" }],
    }),
  }),
});

export const {
  useSearchFoodQuery,
  useAddCustomFoodMutation,
  useGetCustomFoodsQuery,
  useUpdateCustomFoodMutation,
  useDeleteCustomFoodMutation,
  useAddFavoriteFoodMutation,
  useRemoveFavoriteFoodMutation,
  useGetFavoriteFoodsQuery,
} = foodApiSlice;
