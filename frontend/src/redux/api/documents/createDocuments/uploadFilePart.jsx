import { baseAPI } from "../../baseAPI";

export const uploadFilePart = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadFilePart: builder.mutation({
      query: (body) => ({
        url: "/api/document/upload-file-part",
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

export const { useUploadFilePartMutation } = uploadFilePart;
