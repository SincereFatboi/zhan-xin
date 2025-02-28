import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, signOut } from "../slice/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = getState().auth.accessToken;
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.data?.statusCode === 403) {
    const refreshTokenResult = await baseQuery(
      "/api/user/refresh-token",
      api,
      extraOptions
    );

    if (refreshTokenResult?.data) {
      api.dispatch(setCredentials({ ...refreshTokenResult.data }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(signOut());
    }
  }

  return result;
};

export const baseAPI = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
