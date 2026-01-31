import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import Layout from "./components/Layout/Layout";
import Navbar from "./components/Navbar/Navbar";
import PersistSignIn from "./components/PersistSignIn/PersistSignIn";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import Index from "./pages/Index/Index";
import RoomView from "./pages/RoomView/RoomView";
import Rooms from "./pages/Rooms/Rooms";
import Scores from "./pages/Scores/Scores";
import Users from "./pages/Users/Users";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#000000",
      },
      secondary: {
        main: "#ffffff",
      },
    },
    typography: {
      fontFamily: "Montserrat, sans-serif",
      button: {
        textTransform: "none",
      },
      h1: {
        fontSize: "5rem",
        fontWeight: 400,
      },
      h5: {
        fontWeight: 500,
      },
    },
  }),
);

const App = () => {
  const role = useSelector((state) => state.auth.role);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        classes={{ containerRoot: "snackbar-container-root" }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public */}
              <Route index element={<Index />} />

              {/* Protected */}
              <Route element={<PersistSignIn />}>
                <Route element={<RequireAuth />}>
                  <Route element={<Navbar />}>
                    <Route path="/scores" element={<Scores />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/rooms/:roomName" element={<RoomView />} />
                    <Route
                      path="/users"
                      element={
                        role === "SUPER_ADMIN" ? (
                          <Users />
                        ) : (
                          <Navigate to="/" replace />
                        )
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <Box sx={{ fontWeight: "bold", fontSize: "8rem" }}>
                          Page not found!
                        </Box>
                      }
                    />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
