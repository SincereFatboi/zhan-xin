import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    id: null,
    role: null,
    username: null,
    status: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, id, role, username, status } = action.payload;
      state.accessToken = accessToken;
      state.id = id;
      state.role = role;
      state.username = username ?? null;
      state.status = status ?? null;
    },
    setSignOut: (state, action) => {
      state.accessToken = null;
      state.id = null;
      state.role = null;
      state.username = null;
      state.status = null;
    },
  },
});

export const { setCredentials, setSignOut } = authSlice.actions;
export default authSlice.reducer;
