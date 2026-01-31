import { baseAPI } from "../baseAPI";

export const signUpAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (body) => ({
        url: "/api/auth/sign-up",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSignUpMutation } = signUpAPI;
