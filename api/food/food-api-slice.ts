import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFood: builder.query({
      query: ({ userId, searchItem }) => ({
        url: `/api/v1/foods/${userId}/search/${searchItem}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, searchItem }) => [
        { type: "Food", id: `search_${userId}_${searchItem}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getRecentFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/foods/${userId}/recent`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `recent_${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getCustomFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/foods/${userId}/custom`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `custom_${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getFavoriteFoods: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/foods/${userId}/favorites`,
        method: "GET",
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Food", id: `favorites_${userId}` },
        { type: "Food", id: "FAVORITES" },
      ],
    }),
    addCustomFood: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/v1/foods/${userId}/custom`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Food", id: `custom_${userId}` },
        { type: "Food", id: "LIST" },
      ],
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
      invalidatesTags: (result, error, { userId }) => [
        // Only invalidate favorite-related and search caches
        { type: "Food", id: "FAVORITES" },
        { type: "Food", id: `favorites_${userId}` },
        // Invalidate search results to show updated favorite status
        { type: "Food", id: "LIST" },
        // Invalidate food logs to show updated favorite status
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    removeFavoriteFood: builder.mutation({
      query: ({ userId, favFoodId }) => ({
        url: `/api/v1/foods/favorites/${favFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        // Only invalidate favorite-related and search caches
        { type: "Food", id: "FAVORITES" },
        { type: "Food", id: `favorites_${userId}` },
        // Invalidate search results to show updated favorite status
        { type: "Food", id: "LIST" },
        // Invalidate food logs to show updated favorite status
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    deleteCustomFood: builder.mutation({
      query: ({ userId, customFoodId }) => ({
        url: `/api/v1/foods/${userId}/custom/${customFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Food", id: `custom_${userId}` },
        { type: "Food", id: "LIST" },
        // Invalidate favorites in case the deleted custom food was favorited
        { type: "Food", id: "FAVORITES" },
        { type: "Food", id: `favorites_${userId}` },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useSearchFoodQuery,
  useGetRecentFoodsQuery,
  useAddCustomFoodMutation,
  useGetCustomFoodsQuery,
  useUpdateCustomFoodMutation,
  useDeleteCustomFoodMutation,
  useAddFavoriteFoodMutation,
  useRemoveFavoriteFoodMutation,
  useGetFavoriteFoodsQuery,
} = foodApiSlice;
