import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import TransitionModal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "background.paper",
  border: "2px solid",
  borderRadius: "1rem",
  boxShadow: 24,
  padding: "1em 1em",
};

const Modal = () => {
  const [open, setOpen] = useState(true);
  const isScreenBelowSm = useMediaQuery((screen) =>
    screen.breakpoints.down("sm")
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <TransitionModal
        open={open}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            sx: {
              pointerEvents: "none",
            },
          },
        }}
      >
        <Fade in={open}>
          <Box sx={{ ...style, width: isScreenBelowSm ? "80%" : "30rem" }}>
            <h2
              style={{
                textAlign: "justify",
                padding: 0,
                margin: 0,
              }}
            >
              Testing a text in a modal super cool
            </h2>
            <Typography
              component=""
              style={{
                textAlign: "justify",
                padding: "1em 0em",
                margin: 0,
              }}
            >
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </Typography>
            <Box
              component="footer"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: 0,
                margin: 0,
              }}
            >
              <Button
                variant="contained"
                onClick={handleClose}
                size="small"
                sx={{ mr: 1 }}
              >
                Close modal
              </Button>
              <Button variant="contained" onClick={handleClose} size="small">
                Close modal
              </Button>
            </Box>
          </Box>
        </Fade>
      </TransitionModal>
    </Box>
  );
};

export default Modal;
