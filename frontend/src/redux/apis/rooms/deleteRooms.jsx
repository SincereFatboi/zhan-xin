import { baseAPI } from "../baseAPI";

export const deleteRooms = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    deleteRoom: builder.mutation({
      query: (roomName) => ({
        url: `/api/rooms/delete-room/${roomName}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useDeleteRoomMutation } = deleteRooms;
