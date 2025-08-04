import { apiSlice } from "../api-slice";

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: ({ userId }) => ({
        url: `/api/v1/settings/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) =>
        result ? [{ type: "Settings", id: arg.userId }] : [],
    }),
  }),
});

export const { useGetSettingsQuery } = settingsApiSlice;
