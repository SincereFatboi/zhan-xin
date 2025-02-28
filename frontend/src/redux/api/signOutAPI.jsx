import { baseAPI } from "./baseAPI";

export const signOutAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    signOut: builder.query({
      query: () => `api/user/sign-out`,
    }),
  }),
});

export const { useSignOutQuery, useLazySignOutQuery } = signOutAPI;
