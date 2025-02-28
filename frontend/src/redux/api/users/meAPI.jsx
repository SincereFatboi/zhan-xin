import { baseAPI } from "../baseAPI";

export const meAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query({
      query: () => `api/user/me`,
    }),
  }),
});

export const { useMeQuery, useLazyMeQuery } = meAPI;
