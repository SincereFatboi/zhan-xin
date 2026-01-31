import { baseAPI } from "../baseAPI";

export const updateRoom = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    updateRoom: builder.mutation({
      query: ({ roomName, body }) => ({
        url: `/api/rooms/update-room/${encodeURIComponent(roomName)}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useUpdateRoomMutation } = updateRoom;
