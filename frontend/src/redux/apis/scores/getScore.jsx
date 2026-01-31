import { baseAPI } from "../baseAPI";

export const getScore = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getScore: builder.query({
      query: (params) => ({
        url: "/api/scores/get-score",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetScoreQuery, useLazyGetScoreQuery } = getScore;
