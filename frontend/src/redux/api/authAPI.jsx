import { baseAPI } from "./baseAPI";

export const authAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (body) => ({
        url: "/api/user/auth",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const { useSignInMutation } = authAPI;
