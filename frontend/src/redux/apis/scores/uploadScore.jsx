import { baseAPI } from "../baseAPI";

export const uploadScore = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadScore: builder.query({
      query: (params) => ({
        url: "/api/scores/upload-score",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useUploadScoreQuery, useLazyUploadScoreQuery } = uploadScore;
