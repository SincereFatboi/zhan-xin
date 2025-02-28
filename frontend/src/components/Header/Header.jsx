import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import styled from "@mui/material/styles/styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useState } from "react";
import ListItems from "./ListItems";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { useSelector } from "react-redux";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

const drawerWidth = "180px";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
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
  "& .MuiDrawer-paper": {
    position: "absolute",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      //   [theme.breakpoints.up("sm")]: {
      //     width: theme.spacing(7),
      //   },
    }),
  },
}));

const sections = [
  { title: "Documents", path: "/documents", icon: <AssignmentIcon /> },
  { title: "Rooms", path: "/rooms", icon: <MeetingRoomIcon /> },
];

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const userID = useSelector((state) => state.auth.id);
  const navigate = useNavigate();
  const isScreenBelowSm = useMediaQuery((screen) =>
    screen.breakpoints.down("sm")
  );
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const activeSection = sections.find(
    (section) => location.pathname === section.path
  ); // v6+

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "20px", // keep right padding when drawer closed
            display: "flex",
            justifyContent: open ? "flex-end" : "space-between",
          }}
        >
          <Fade
            in={!open}
            mountOnEnter
            unmountOnExit
            timeout={{ enter: 500, exit: 0 }}
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
          <PersonIcon
            fontSize="large"
            sx={{
              cursor: "pointer",
            }}
            onClick={() => {
              navigate(`/account/${userID}`);
            }}
          />
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
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          <ListItems sections={sections} />
          {/* <Divider sx={{ my: 1 }} /> */}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) => theme.palette.grey[100],
          flexGrow: 1,
          height: "100svh",
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Toolbar />
        <Container
          sx={{
            margin: "auto 0",
            padding: "80px 0 15px 0",
            position: "relative",
            left: "12px",
            width: "82svw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Outlet />

          {/* Main content */}
          {/* <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: 240,
                }}
              ></Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: 240,
                }}
              ></Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{ p: 2, display: "flex", flexDirection: "column" }}
              ></Paper>
            </Grid>
          </Grid> */}
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
