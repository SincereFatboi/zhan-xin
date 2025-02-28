import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { schema } from "./helper";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slice/authSlice";
import { useSignInMutation } from "../../redux/api/authAPI";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../hooks/useNotify";

const SignIn = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [signIn, { isLoading }] = useSignInMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useNotify();

  const toggleShowPassword = () => setShowPassword((show) => !show);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const credentials = await signIn({ email, password }).unwrap();
      notify("success", "Sign In Successful");
      dispatch(
        setCredentials({
          ...credentials,
        })
      );
      navigate("/documents");
    } catch (err) {
      if (!err?.data) {
        notify("error", "No Server Response");
      } else if (err.data) {
        notify("error", err.data?.message);
      } else {
        notify("error", "Sign in failed");
      }
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ margin: "auto", mx: 2 }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", mb: 1 }}>
          Sign In
        </Typography>
        <TextField
          autoComplete="on"
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
          autoComplete="on"
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
          sx={{
            "& .MuiFormHelperText-root": {
              position: "absolute",
              bottom: "-1.2rem",
              left: "-0.5rem",
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          Sign In
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
              Don't have an account?
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SignIn;
