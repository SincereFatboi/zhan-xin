import { baseAPI } from "../../baseAPI";

export const createMultiPartUpload = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    creatMultiPartUpload: builder.mutation({
      query: (body) => ({
        url: "/api/document/create-multi-part-upload",
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

export const { useCreatMultiPartUploadMutation } = createMultiPartUpload;
