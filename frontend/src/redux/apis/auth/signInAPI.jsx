import { baseAPI } from "../baseAPI";

export const signInAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (body) => ({
        url: "/api/auth/sign-in",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSignInMutation } = signInAPI;
