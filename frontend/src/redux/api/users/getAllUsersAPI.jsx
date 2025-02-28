import { baseAPI } from "../baseAPI";

export const getAllUsersAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => "api/user/all-users",
    }),
  }),
});

export const { useGetAllUsersQuery } = getAllUsersAPI;
