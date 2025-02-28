import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    id: null,
    role: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, id, role } = action.payload;
      state.accessToken = accessToken;
      state.id = id;
      state.role = role;
    },
    signOut: (state, action) => {
      state.accessToken = null;
      state.id = null;
      state.role = null;
    },
  },
});

export const { setCredentials, signOut } = authSlice.actions;
export default authSlice.reducer;
