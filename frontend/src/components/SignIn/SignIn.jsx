import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { useNotify } from "../../hooks/useNotify";
import { useSignInMutation } from "../../redux/apis/auth/signInAPI";
import { setCredentials } from "../../redux/slices/authSlice";
import "./SignIn.css";
import { schema } from "./helpers";

const SignIn = ({ handlesignInSignUp }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notify = useNotify();
  const [signIn, signInStatus] = useSignInMutation();

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = async ({ username, password }) => {
    try {
      const credentials = await signIn({ username, password }).unwrap();
      notify("success", "Sign in successful");
      dispatch(
        setCredentials({
          ...credentials,
        }),
      );
      navigate("/scores");
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else if (err?.data) {
        if (err?.status === 403) {
          notify("warning", err?.data?.message);
        } else {
          notify("error", err?.data?.message);
        }
      } else {
        notify("error", "Unknown error occurred");
      }
    }
  };
  return (
    <>
      <Stack
        spacing={3}
        sx={{ mb: 2, width: "80%" }}
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          autoComplete="on"
          margin="normal"
          required
          id="username"
          label="Username"
          name="username"
          {...register("username")}
          error={formState.errors.username && true}
          helperText={
            formState.errors.username && formState.errors.username.message
          }
          sx={{
            "& .MuiFormHelperText-root": {
              margin: 0,
              padding: 0,
            },
            input: { color: "white", borderColor: "white" },
            "& .MuiInputLabel-root": { color: "white" },
            "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          autoComplete="on"
          margin="normal"
          required
          name="password"
          label="Password"
          id="password"
          type="password"
          {...register("password")}
          error={formState.errors.password && true}
          helperText={
            formState.errors.password && formState.errors.password.message
          }
          sx={{
            width: "100%",
            minWidth: 0,
            "& .MuiFormHelperText-root": {
              margin: 0,
              padding: 0,
            },
            input: { color: "white", borderColor: "white" },
            "& .MuiInputLabel-root": { color: "white" },
            "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
        <Button type="submit" variant="contained" color="secondary" fullWidth>
          Sign In
        </Button>
      </Stack>
      <Link
        onClick={handlesignInSignUp}
        variant="body2"
        fontWeight={500}
        underline="hover"
        sx={{ cursor: "pointer", color: "secondary.main" }}
      >
        {"Don't have an account? "}
        <Box component="span" sx={{ color: "#016bF8" }}>
          {" "}
          Sign Up
        </Box>
      </Link>
    </>
  );
};

export default SignIn;
