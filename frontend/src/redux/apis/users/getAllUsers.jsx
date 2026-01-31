import { baseAPI } from "../baseAPI";

export const getAllUsers = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (params) => ({
        url: "/api/users/get-all-users",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetAllUsersQuery, useLazyGetAllUsersQuery } = getAllUsers;
