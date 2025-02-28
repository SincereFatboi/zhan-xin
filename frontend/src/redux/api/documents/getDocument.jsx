import { baseAPI } from "../baseAPI";

export const getDocumentAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getDocument: builder.query({
      query: (documentKey) => `api/document/${documentKey}`,
    }),
  }),
});

export const { useGetDocumentQuery, useLazyGetDocumentQuery } = getDocumentAPI;
