import { apiSlice } from "../api-slice";
import { User } from "@/interfaces/user-interfaces";
import { setCredentials, logOut } from "@/api/auth/auth-slice";
import { resetUserInfo } from "@/api/user/user-slice";
import { resetWorkoutProgram } from "../workout-program/workout-program-slice";
import { resetWeeklyRate } from "../weight-log/weight-log-slice";

interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

interface RegisterResponse {
  data: {
    user: {
      user_id: string;
      email: string;
    };
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/v1/auth/signup",
        method: "POST",
        body: userData,
      }),
    }),
    verifyOTP: builder.mutation<{ message: string }, VerifyOTPRequest>({
      query: ({ user_id, email, otp }) => ({
        url: `/api/v1/auth/verify-otp/${user_id}`,
        method: "POST",
        body: { email, otp },
      }),
    }),
    resendOTP: builder.mutation<{ message: string }, ResendOTPRequest>({
      query: ({ user_id, email }) => ({
        url: `/api/v1/auth/resend-otp/${user_id}`,
        method: "POST",
        body: { email },
      }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/api/v1/auth/refresh",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));
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
          dispatch(resetUserInfo());
          dispatch(resetWorkoutProgram());
          dispatch(resetWeeklyRate());
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
  useSignupMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApiSlice;
