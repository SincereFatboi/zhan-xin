import { baseAPI } from "./baseAPI";

export const getRefreshTokenAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getRefreshToken: builder.query({
      query: () => "/api/user/refresh-token",
    }),
  }),
});

export const { useGetRefreshTokenQuery, useLazyGetRefreshTokenQuery } =
  getRefreshTokenAPI;
