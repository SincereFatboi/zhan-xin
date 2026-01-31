import { baseAPI } from "../baseAPI";

export const createRoom = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation({
      query: (body) => ({
        url: "/api/rooms/create-room",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateRoomMutation } = createRoom;
