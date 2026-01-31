import { baseAPI } from "../baseAPI";

export const deleteUser = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/delete-user/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useDeleteUserMutation } = deleteUser;
