import { baseAPI } from "../baseAPI";

export const deleteScores = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    deleteScore: builder.mutation({
      query: (scoreName) => ({
        url: `/api/scores/delete-score/${scoreName}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useDeleteScoreMutation } = deleteScores;
