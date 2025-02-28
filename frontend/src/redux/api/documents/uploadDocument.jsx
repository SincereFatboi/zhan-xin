import { baseAPI } from "../baseAPI";

export const uploadDocumentAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadDocument: builder.mutation({
      query: (body) => ({
        url: "/api/document/upload-document",
        method: "POST",
        body: body,
        prepareHeaders: (headers) => {
          headers.set("Content-Type", "multipart/form-data");
          return headers;
        },
      }),
    }),
  }),
});

export const { useUploadDocumentMutation } = uploadDocumentAPI;
