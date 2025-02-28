import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import ShareIcon from "@mui/icons-material/Share";
import { Box } from "@mui/material";
import BasicSpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import React from "react";

const actions = [
  { icon: <FileCopyIcon />, name: "Copy" },
  { icon: <SaveIcon />, name: "Save" },
  { icon: <PrintIcon />, name: "Print" },
  { icon: <ShareIcon />, name: "Share" },
  { icon: <PrintIcon />, name: "Print" },
  { icon: <ShareIcon />, name: "Share" },
];

const SpeedDial = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

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
          sx={{
            border: 1,
            borderColor: "divider",
            backgroundColor: "white",
            transition: " 0.1s",
            position: index >= 3 ? "absolute" : "relative",
            bottom: index >= 3 ? 125 : 65,
            left: index >= 3 && `${0.6 + (index - 2) * 4}rem`,
            right: -74,
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
