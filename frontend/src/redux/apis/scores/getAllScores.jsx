import { baseAPI } from "../baseAPI";

export const getAllScores = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAllScores: builder.query({
      query: (params) => ({
        url: "/api/scores/get-all-scores",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetAllScoresQuery, useLazyGetAllScoresQuery } = getAllScores;
