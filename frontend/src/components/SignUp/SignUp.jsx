import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { schema } from "./helper";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const SignUp = React.memo((props) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((show) => !show);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log("🚀 ~ onSubmit ~ data:", data.get("email"));
    // console.log({
    //   email: data.get("email"),
    //   password: data.get("password"),
    // });
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ mt: 1, mx: 3, margin: "auto" }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", mb: 3 }}>
          Sign Up
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            {...register("firstName")}
            error={formState.errors.firstName && true}
            helperText={
              formState.errors.firstName && formState.errors.firstName.message
            }
            sx={{
              "& .MuiFormHelperText-root": {
                position: "absolute",
                bottom: "-1.2rem",
                left: "-0.5rem",
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            {...register("lastName")}
            error={formState.errors.lastName && true}
            helperText={
              formState.errors.lastName && formState.errors.lastName.message
            }
            sx={{
              "& .MuiFormHelperText-root": {
                position: "absolute",
                bottom: "-1.2rem",
                left: "-0.5rem",
              },
            }}
          />
        </Stack>

        <TextField
          autoComplete="off"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          {...register("email")}
          error={formState.errors.email && true}
          helperText={formState.errors.email && formState.errors.email.message}
          sx={{
            "& .MuiFormHelperText-root": {
              position: "absolute",
              bottom: "-1.2rem",
              left: "-0.5rem",
            },
          }}
        />
        <TextField
          autoComplete="off"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          id="password"
          {...register("password")}
          error={formState.errors.password && true}
          helperText={
            formState.errors.password && formState.errors.password.message
          }
          sx={{
            "& .MuiFormHelperText-root": {
              position: "absolute",
              bottom: "-1.2rem",
              left: "-0.5rem",
            },
          }}
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          Sign Up
        </Button>
        <Grid container sx={{ justifyContent: "flex-end" }}>
          <Grid
            item
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              onClick={props.toggleSignIn}
              sx={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Have an existing account?
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
});

export default SignUp;
