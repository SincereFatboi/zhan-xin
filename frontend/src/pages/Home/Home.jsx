import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import zhanXinIconBackground from "../../assets/zhanXinIconBackground.png";
import { Slide } from "@mui/material";
import SignUp from "../../components/SignUp/SignUp";
import SignIn from "../../components/SignIn/SignIn";

const Home = () => {
  const [slide, setSlide] = useState(true);
  const [signIn, setSignIn] = useState(true);

  const handleSlide = () => {
    setSlide((prev) => !prev);
  };

  const toggleSignIn = () => setSignIn((signIn) => !signIn);

  return (
    <Box>
      <Slide
        direction="down"
        in={slide}
        appear={false}
        mountOnEnter
        unmountOnExit
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100svh",
            backgroundColor: "black",
            position: "relative",
            zIndex: 1,
          }}
        >
          <img
            src={zhanXinIconBackground}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "10rem",
            }}
          />
          <Box>
            <Button
              sx={{
                backgroundColor: "secondary.main",
                width: "8rem",
                mt: 1,
                "&:hover": {
                  backgroundColor: "secondary.main",
                },
              }}
              size="large"
              onClick={handleSlide}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Slide>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {signIn ? (
          <SignIn signIn={signIn} toggleSignIn={toggleSignIn} />
        ) : (
          <SignUp signIn={signIn} toggleSignIn={toggleSignIn} />
        )}
      </Box>
    </Box>
  );
};

export default Home;
