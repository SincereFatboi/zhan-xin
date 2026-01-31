import React from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const Loading = ({ progress }) => {
  return (
    <Backdrop open={true} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
      {progress ? (
        <>
          <CircularProgress
            color="secondary"
            size={60}
            value={progress}
            variant="determinate"
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              fontWeight={500}
              sx={{ color: "secondary.main" }}
            >
              {`${progress}%`}
            </Typography>
          </Box>
        </>
      ) : (
        <CircularProgress color="secondary" size={60} />
      )}
    </Backdrop>
  );
};

export default Loading;
