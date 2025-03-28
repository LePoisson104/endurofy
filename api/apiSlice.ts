import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { RootState } from "../lib/store";
import { setCredentials } from "../features/auth/authSlice";

interface RefreshResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 403) {
    console.log("sending refresh token");

    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

    if (refreshResult?.data) {
      const refreshData = refreshResult.data as RefreshResponse;
      api.dispatch(
        setCredentials({
          user: refreshData.user,
          token: refreshData.token,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      const error = refreshResult?.error as FetchBaseQueryError;
      if (error?.status === 403) {
        (error.data as any).message = "Your login has expired. ";
      }
      return refreshResult;
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
