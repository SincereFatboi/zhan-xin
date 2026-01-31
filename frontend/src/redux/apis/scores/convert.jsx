import { baseAPI } from "../baseAPI";

export const convertScore = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    convertScore: builder.mutation({
      query: (body) => ({
        url: "/api/scores/convert",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useConvertScoreMutation } = convertScore;
