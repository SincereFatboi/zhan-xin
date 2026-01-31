import { baseAPI } from "../baseAPI";

export const updateUser = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: ({ userId, payload }) => ({
        url: `/api/users/update-user/${userId}`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
});

export const { useUpdateUserMutation } = updateUser;
