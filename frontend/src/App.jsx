import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import { SnackbarProvider } from "notistack";
import Layout from "./components/Layout/Layout";
import PersistSignIn from "./components/PersistSignIn/PersistSignIn";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import Loading from "./components/Loading/Loading";
import Documents from "./pages/Documents/Documents";
import Rooms from "./pages/Rooms/Rooms";
import Account from "./pages/Account/Account";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#000000",
      },
      secondary: {
        main: "#FFFFFF",
      },
    },
    typography: {
      fontFamily: "Montserrat, sans-serif",
      button: {
        textTransform: "none",
      },
      h1: {
        fontSize: "5rem",
      },
    },
  })
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public */}
                <Route index element={<Home />} />

                {/* Protected */}
                <Route element={<PersistSignIn />}>
                  <Route element={<RequireAuth />}>
                    <Route element={<Header />}>
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/account/:userID" element={<Account />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
