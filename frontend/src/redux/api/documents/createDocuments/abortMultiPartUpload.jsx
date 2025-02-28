import { baseAPI } from "../../baseAPI";

export const abortMultiPartUpload = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    abortMultiPartUpload: builder.mutation({
      query: (body) => ({
        url: "/api/document/abort-multi-part-upload",
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

export const { useAbortMultiPartUploadMutation } = abortMultiPartUpload;
