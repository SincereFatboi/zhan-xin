import React, { useEffect } from "react";
import { useGetUserQuery } from "../../redux/api/users/getUserAPI";
import { useParams } from "react-router-dom";
import "./Account.css";
import { Paper, Typography, Box, Stack, Grid } from "@mui/material";
import Loading from "../../components/Loading/Loading";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import { useLazySignOutQuery } from "../../redux/api/signOutAPI";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../hooks/useNotify";
import { useDispatch } from "react-redux";

const Account = () => {
  const { userID } = useParams();
  const { data, isSuccess, isLoading, isError, error } =
    useGetUserQuery(userID);
  const role = useSelector((state) => state.auth.role);
  const [signOut, signOutResponse] = useLazySignOutQuery();
  const navigate = useNavigate();
  const notify = useNotify();
  const dispatch = useDispatch();

  const handleSignOut = () => {
    const signOutUser = async () => {
      await signOut();
    };

    signOutUser();
    // dispatch(baseAPI.util.resetApiState());
    navigate("/");
  };

  useEffect(() => {
    if (isError) {
      navigate(-1);
      notify("error", error.data?.message);
    }
  }, [data, error]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: "60%",
          padding: "2rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        square={false}
      >
        <Grid container rowSpacing={3} columnSpacing={1}>
          <Grid item md={6} xs={12}>
            <Typography>First Name: {data?.firstName}</Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            <Typography>Last Name: {data?.lastName}</Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            Email: {data?.email}
          </Grid>
          <Grid item md={6} xs={12} sm>
            Role: {role}
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button variant="contained" color="error" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default Account;
