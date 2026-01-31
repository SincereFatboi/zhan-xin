import { configureStore } from "@reduxjs/toolkit";

import { baseAPI } from "./apis/baseAPI";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    // Slice
    auth: authReducer,

    // API
    [baseAPI.reducerPath]: baseAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseAPI.middleware),
  devTools: true,
});
