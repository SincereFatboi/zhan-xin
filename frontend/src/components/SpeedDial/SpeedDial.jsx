import React from "react";
import { useNavigate } from "react-router";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EjectIcon from "@mui/icons-material/Eject";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import FollowTheSignsIcon from "@mui/icons-material/FollowTheSigns";
import LogoutIcon from "@mui/icons-material/Logout";
import RemoveIcon from "@mui/icons-material/Remove";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import SaveIcon from "@mui/icons-material/Save";
import ShareIcon from "@mui/icons-material/Share";
import { Box } from "@mui/material";
import BasicSpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";

const SpeedDial = ({
  handleNextScore,
  handlePrevScore,
  handleUpKey,
  handleDownKey,
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
  handleToggleFollow,
  isFollowingScroll,
}) => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleExit = () => {
    navigate("/rooms");
  };

  const actions = [
    {
      icon: <RotateLeftIcon />,
      name: "Reset",
      placement: "bottom",
      onClick: handleResetZoom,
    },
    {
      icon: <RemoveIcon />,
      name: "Zoom Out",
      placement: "bottom",
      onClick: handleZoomOut,
    },
    {
      icon: <ArrowBackIcon onClick={handlePrevScore} />,
      name: "Previous Song",
      placement: "bottom",
    },
    {
      icon: <EjectIcon sx={{ transform: "rotate(180deg)" }} />,
      name: "Down Key",
      placement: "bottom",
      onClick: handleDownKey,
    },
    {
      icon: <EjectIcon />,
      name: "Up Key",
      placement: "top",
      onClick: handleUpKey,
    },
    {
      icon: <ArrowForwardIcon />,
      name: "Next Song",
      placement: "top",
      onClick: handleNextScore,
    },
    {
      icon: <AddIcon />,
      name: "Zoom In",
      placement: "top",
      onClick: handleZoomIn,
    },
    {
      icon: <FollowTheSignsIcon />,
      name: isFollowingScroll ? "Unfollow" : "Follow",
      placement: "top",
      onClick: handleToggleFollow,
    },
  ];

  return (
    <BasicSpeedDial
      ariaLabel=""
      sx={{
        position: "fixed",
        bottom: "0.5rem",
        right: "0.8rem",
        "& .MuiSpeedDial-fab": {
          width: "3.6rem",
          height: "3.6rem",
        },
      }}
      icon={
        <Box
          onClick={handleOpen}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "3.6rem",
            width: "3.6rem",
            borderRadius: "50%",
            transform: open && "rotate(135deg)",
            transition: "transform 0.2s",
          }}
        >
          <SpeedDialIcon
            sx={{
              "& .MuiSpeedDialIcon-icon": {
                height: "1.8rem",
                width: "1.8rem",
                position: "relative",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              },
            }}
          />
        </Box>
      }
      onChange={handleOpen}
      open={open}
      direction="left"
    >
      {actions.map((action, index) => (
        <SpeedDialAction
          key={index}
          icon={action.icon}
          tooltipTitle={action.name}
          placement={action.placement}
          onClick={action.onClick}
          sx={{
            border: 1,
            borderColor: "divider",
            backgroundColor: "white",
            transition: " 0.1s",
            position: index >= 4 ? "absolute" : "relative",
            bottom: index >= 4 ? 125 : 65,
            left: index >= 4 && `${-3.3 + (index - 2) * 4}rem`,
            right: -75,
          }}
          FabProps={{
            size: "medium",
          }}
        />
      ))}
    </BasicSpeedDial>
  );
};

export default SpeedDial;
