import { apiSlice } from "../api-slice";

export const waterLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWaterLog: builder.query({
      query: ({ userId, date }) => ({
        url: `/api/v1/water-logs/${userId}/date/${date}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, date }) => [
        { type: "WaterLog", id: `${userId}-${date}` },
        { type: "WaterLog", id: "LIST" },
      ],
    }),
    createWaterLog: builder.mutation({
      query: ({ userId, date, waterPayload }) => ({
        url: `/api/v1/water-logs/${userId}/date/${date}`,
        method: "POST",
        body: waterPayload,
      }),
      invalidatesTags: (result, error, { userId, date }) => [
        { type: "WaterLog", id: `${userId}-${date}` },
        { type: "WaterLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    updateWaterLog: builder.mutation({
      query: ({ waterLogId, foodLogId, waterPayload }) => ({
        url: `/api/v1/water-logs/${waterLogId}/${foodLogId}`,
        method: "PATCH",
        body: waterPayload,
      }),
      invalidatesTags: (result, error, { userId, date }) => [
        { type: "WaterLog", id: `${userId}-${date}` },
        { type: "WaterLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
    deleteWaterLog: builder.mutation({
      query: ({ waterLogId, foodLogId }) => ({
        url: `/api/v1/water-logs/${waterLogId}/${foodLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId, date }) => [
        { type: "WaterLog", id: `${userId}-${date}` },
        { type: "WaterLog", id: "LIST" },
        { type: "FoodLog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWaterLogQuery,
  useCreateWaterLogMutation,
  useUpdateWaterLogMutation,
  useDeleteWaterLogMutation,
} = waterLogApiSlice;
