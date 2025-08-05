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
    toggleTheme: builder.mutation({
      query: ({ userId, theme }) => ({
        url: `/api/v1/settings/toggle-theme/${userId}`,
        method: "PATCH",
        body: { theme },
      }),
      invalidatesTags: (result: any, error: any, arg: any) => [
        { type: "Settings", id: arg.userId },
      ],
    }),
  }),
});

export const { useGetSettingsQuery, useToggleThemeMutation } = settingsApiSlice;
