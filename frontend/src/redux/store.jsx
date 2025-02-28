import { configureStore } from "@reduxjs/toolkit";
import { baseAPI } from "./api/baseAPI";
import authReducer from "./slice/authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";

// const authPersistConfig = {
//   key: "auth", // Stored under `localStorage['persist:auth']`
//   storage,
//   whitelist: ["isAuthenticated"],
//   transforms: [
//     encryptTransform({
//       secretKey: import.meta.env.VITE_PERSIST_SECRET,
//       onError: (err) => {
//         console.log(err);
//         localStorage.removeItem("persist:auth");
//       },
//     }),
//   ],
// };

// const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    // Slice
    // auth: persistedAuthReducer,
    auth: authReducer,

    // API
    [baseAPI.reducerPath]: baseAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseAPI.middleware),
    // { serializableCheck: false }
  devTools: true,
});

setupListeners(store.dispatch); // Setup listeners for the API slice(s)

// export const persistor = persistStore(store);
