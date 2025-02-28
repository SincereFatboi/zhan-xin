import { baseAPI } from "../../baseAPI";

export const completeMultiPartUpload = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    completeMultiPartUpload: builder.mutation({
      query: (body) => ({
        url: "/api/document/complete-multi-part-upload",
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

export const { useCompleteMultiPartUploadMutation } = completeMultiPartUpload;
