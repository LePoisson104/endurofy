import { apiSlice } from "../api-slice";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFood: builder.query({
      query: ({ searchItem }: { searchItem: string }) => ({
        url: `/api/v1/foods/search/${searchItem}`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        { userId, searchItem }: { userId: string; searchItem: string }
      ) => [
        { type: "Food", id: `search_${userId}_${searchItem}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getRecentFoods: builder.query({
      query: () => ({
        url: `/api/v1/foods/recent`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        { userId }: { userId: string }
      ) => [
        { type: "Food", id: `recent_${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getCustomFoods: builder.query({
      query: () => ({
        url: `/api/v1/foods/custom`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        { userId }: { userId: string }
      ) => [
        { type: "Food", id: `custom_${userId}` },
        { type: "Food", id: "LIST" },
      ],
    }),
    getFavoriteFoods: builder.query({
      query: () => ({
        url: `/api/v1/foods/favorites`,
        method: "GET",
      }),
      providesTags: (
        result: any,
        error: any,
        { userId }: { userId: string }
      ) => [
        { type: "Food", id: `favorites_${userId}` },
        { type: "Food", id: "FAVORITES" },
      ],
    }),
    addCustomFood: builder.mutation({
      query: ({ userId, payload }: { userId: string; payload: any }) => ({
        url: `/api/v1/foods/custom`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (
        result: any,
        error: any,
        { userId, payload }: { userId: string; payload: any }
      ) => [
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
        url: `/api/v1/foods/favorites`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (
        result: any,
        error: any,
        { userId, payload }: { userId: string; payload: any }
      ) => [
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
      query: ({
        userId,
        favFoodId,
      }: {
        userId: string;
        favFoodId: string;
      }) => ({
        url: `/api/v1/foods/favorites/${favFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        result: any,
        error: any,
        { userId, favFoodId }: { userId: string; favFoodId: string }
      ) => [
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
      query: ({
        userId,
        customFoodId,
      }: {
        userId: string;
        customFoodId: string;
      }) => ({
        url: `/api/v1/foods/custom/${customFoodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        result: any,
        error: any,
        { userId, customFoodId }: { userId: string; customFoodId: string }
      ) => [
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
