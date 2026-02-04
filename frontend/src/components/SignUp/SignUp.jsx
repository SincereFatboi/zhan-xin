import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { useNotify } from "../../hooks/useNotify";
import { useSignUpMutation } from "../../redux/apis/auth/signUp";
import "./SignUp.css";
import { schema } from "./helpers";

const SignUp = ({ handlesignInSignUp }) => {
  const notify = useNotify();
  const [signUp, signUpStatus] = useSignUpMutation();

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = async ({ firstName, lastName, username, password }) => {
    try {
      await signUp({ firstName, lastName, username, password }).unwrap();
      notify("success", "Sign up successful");
      handlesignInSignUp();
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else {
        notify("error", err?.data?.message || "Unknown error occurred");
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
          Sign Up
        </Button>
      </Stack>
      <Link
        onClick={handlesignInSignUp}
        variant="body2"
        fontWeight={500}
        underline="hover"
        sx={{ cursor: "pointer", color: "secondary.main" }}
      >
        {"Already have an account? "}
        <Box component="span" sx={{ color: "#016bF8" }}>
          {" "}
          Sign In
        </Box>
      </Link>
    </>
  );
};

export default SignUp;
