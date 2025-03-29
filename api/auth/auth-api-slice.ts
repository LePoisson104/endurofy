import { apiSlice } from "../api-slice";
import { User } from "@/interfaces/user-interfaces";
import { setAccessToken, logOut } from "@/api/auth/auth-slice";

interface LoginResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

interface RegisterResponse {
  user_id: string;
  email: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface VerifyOTPRequest {
  user_id: string;
  email: string;
  otp: string;
}

interface ResendOTPRequest {
  user_id: string;
  email: string;
}

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    verifyOTP: builder.mutation<{ message: string }, VerifyOTPRequest>({
      query: (otpData) => ({
        url: "/api/v1/auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
    }),
    resendOTP: builder.mutation<{ message: string }, ResendOTPRequest>({
      query: (emailData) => ({
        url: "/api/v1/auth/resend-otp",
        method: "POST",
        body: emailData,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: "/api/v1/auth/refresh",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAccessToken(data?.data?.accessToken));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logOut());
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApiSlice;
