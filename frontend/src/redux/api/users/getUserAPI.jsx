import { baseAPI } from "../baseAPI";

export const getUserAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (userID) => `api/user/${userID}`,
    }),
  }),
});

export const { useGetUserQuery } = getUserAPI;
