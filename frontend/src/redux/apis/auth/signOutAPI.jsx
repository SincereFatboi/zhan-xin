import { baseAPI } from "../baseAPI";

export const signOutAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    signOut: builder.query({
      query: () => ({ url: "api/auth/sign-out", method: "GET" }),
    }),
  }),
});

export const { useSignOutQuery, useLazySignOutQuery } = signOutAPI;
