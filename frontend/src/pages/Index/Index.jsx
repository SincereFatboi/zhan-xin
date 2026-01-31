import { useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import topography from "../../assets/topography.svg";
import zhanXinIconBackground from "../../assets/zhanXinIconBackground.png";
import SignIn from "../../components/SignIn/SignIn";
import SignUp from "../../components/SignUp/SignUp";
import "./Index.css";

const Index = () => {
  const [signInSignUp, setSignInSignUp] = useState(true);

  const handlesignInSignUp = () => {
    setSignInSignUp((prev) => !prev);
  };

  return (
    <>
      <Grid
        container
        sx={{
          height: "100vh",
        }}
      >
        <Grid size={{ xs: false, sm: false, md: 7 }}>
          <Box
            className="special-background-effect"
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "flex",
              },
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h2"
              fontWeight="400"
              align="center"
              sx={{ px: 3 }}
              color="white"
            >
              Unite musicians in seamless collaboration.
            </Typography>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 12, md: 5 }}
          component={Paper}
          elevation={6}
          square
          sx={{
            backgroundImage: `url(${topography})`,
            backgroundColor: "#dab5f5ff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              my: "auto",
              px: 2,
              pt: 3,
              pb: 3.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "20rem",
              backgroundColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <img
              src={zhanXinIconBackground}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "4rem",
              }}
            />
            <Box sx={{ width: "100%", mt: 1, mb: 2.2 }}>
              <Divider
                sx={{
                  opacity: 1,
                  "&::before, &::after": {
                    // borderTopWidth: "2px",
                    borderColor: "secondary.main",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ color: "secondary.main" }}
                >
                  {signInSignUp ? "Sign In" : "Sign Up"}
                </Typography>
              </Divider>
            </Box>

            {signInSignUp ? (
              <SignIn handlesignInSignUp={handlesignInSignUp} />
            ) : (
              <SignUp handlesignInSignUp={handlesignInSignUp} />
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Index;
