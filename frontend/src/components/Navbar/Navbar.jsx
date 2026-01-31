import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import styled from "@mui/material/styles/styled";
import useMediaQuery from "@mui/material/useMediaQuery";

import topography from "../../assets/topography.svg";
import { useNotify } from "../../hooks/useNotify";
import { useLazySignOutQuery } from "../../redux/apis/auth/signOutAPI";
import { baseAPI } from "../../redux/apis/baseAPI";
import { setSignOut } from "../../redux/slices/authSlice";
import ListItems from "./ListItems";

const drawerWidth = "160px";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 2,
  boxShadow: "none",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth})`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 2,

  "& .MuiDrawer-paper": {
    position: "absolute",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    backgroundColor: "black",
    height: "100vh",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(0),
      //   [theme.breakpoints.up("sm")]: {
      //     width: theme.spacing(7),
      //   },
    }),
  },
}));

const sections = [
  { title: "Scores", path: "/scores", icon: <AudioFileIcon /> },
  { title: "Rooms", path: "/rooms", icon: <MeetingRoomIcon /> },
  {
    title: "Users",
    path: "/users",
    icon: <AccountBalanceIcon />,
  },
];

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signOut, signOutStatus] = useLazySignOutQuery();
  const role = useSelector((state) => state.auth.role);
  const username = useSelector((state) => state.auth.username);
  const notify = useNotify();

  const isScreenBelowSm = useMediaQuery((screen) =>
    screen.breakpoints.down("sm"),
  );
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const activeSection = sections.find(
    (section) => location.pathname === section.path,
  ); // v6+

  const visibleSections = sections.filter((section) => {
    if (section.path === "/users") {
      return role === "SUPER_ADMIN";
    }
    return true;
  });

  const handleSignOut = async () => {
    try {
      await signOut().unwrap();
      dispatch(setSignOut());
      dispatch(baseAPI.util.resetApiState());
      notify("success", "Sign out successfully");
      navigate("/");
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else if (err.data?.message) {
        notify("error", err.data.message);
      } else {
        notify("error", "Sign out failed");
      }
    }
  };

  const isValidRoomPath =
    location.pathname.startsWith("/rooms/") &&
    location.pathname.split("/").filter(Boolean).length > 1;

  return (
    <Box sx={{ display: "flex" }}>
      {!isValidRoomPath && (
        <>
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                // pr: "20px", // keep right padding when drawer closed
                display: "flex",
                justifyContent: open ? "flex-end" : "space-between",
              }}
            >
              <Fade
                in={!open}
                mountOnEnter
                unmountOnExit
                timeout={{ enter: 400, exit: 0 }}
              >
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer}
                  sx={{
                    marginRight: "36px",
                    paddingLeft: isScreenBelowSm ? "12px" : "4px",
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Fade>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                {activeSection?.title}
              </Typography>
              {/* <PersonIcon
            fontSize="large"
            sx={{
              cursor: "pointer",
              }}
              /> */}
              <Typography sx={{ mr: 2 }}>{username}</Typography>
              <Button variant="contained" color="error" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <Fade
                in={open}
                mountOnEnter
                unmountOnExit
                timeout={{ enter: 400, exit: 0 }}
              >
                <IconButton onClick={toggleDrawer}>
                  <ChevronLeftIcon sx={{ color: "secondary.main" }} />
                </IconButton>
              </Fade>
            </Toolbar>
            <Divider />
            <List component="nav" onClick={toggleDrawer}>
              <ListItems sections={visibleSections} />
              {/* <Divider sx={{ my: 1 }} /> */}
            </List>
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          // backgroundColor: (theme) => theme.palette.grey[100],
          paddingTop: !isValidRoomPath ? "5rem" : 0,
          background: `url(${topography})`,
          backgroundColor: "#dab5f5ff",
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Container
          sx={{
            margin: "auto 0",
            width: "96vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Main content */}
          <Outlet />
          <Backdrop
            open={open}
            onClick={toggleDrawer}
            sx={(theme) => ({
              zIndex: theme.zIndex.drawer + 1,
              height: "100vh",
            })}
          />
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
