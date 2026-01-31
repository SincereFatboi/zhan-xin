import { baseAPI } from "../baseAPI";

export const getRefreshTokenAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getRefreshToken: builder.query({
      query: () => ({ url: "/api/auth/refresh-token", method: "GET" }),
    }),
  }),
});

export const { useGetRefreshTokenQuery, useLazyGetRefreshTokenQuery } =
  getRefreshTokenAPI;
