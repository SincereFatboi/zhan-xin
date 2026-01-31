import * as React from "react";

import Box from "@mui/material/Box";
import MuiPopper from "@mui/material/Popper";

// Renamed to avoid conflict

const Popper = ({ open, anchorEl, children }) => {
  const id = open ? "simple-popper" : undefined;

  return (
    <MuiPopper id={id} open={open} anchorEl={anchorEl} placement="left">
      <Box
        sx={{
          border: 1,
          mr: -4,
          p: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 6,
        }}
      >
        {children}
      </Box>
    </MuiPopper>
  );
};

export default Popper;
