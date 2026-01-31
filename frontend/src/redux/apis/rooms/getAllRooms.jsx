import { baseAPI } from "../baseAPI";

export const getAllRooms = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAllRooms: builder.query({
      query: (params) => ({
        url: "/api/rooms/get-all-rooms",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetAllRoomsQuery, useLazyGetAllRoomsQuery } = getAllRooms;
