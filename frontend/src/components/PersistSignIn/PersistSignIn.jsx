import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { setCredentials } from "../../redux/slice/authSlice";
import {
  useGetRefreshTokenQuery,
  useLazyGetRefreshTokenQuery,
} from "../../redux/api/getRefreshTokenAPI";
import { useLazyMeQuery } from "../../redux/api/users/meAPI";
import Loading from "../Loading/Loading";

const PersistSignIn = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [getRefreshToken, { data, isSuccess, isLoading, isError, error }] =
    useLazyGetRefreshTokenQuery();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      // Trigger the lazy query to get the refresh token
      await getRefreshToken();
    };

    accessToken ? setIsCredentialsSet(true) : verifyRefreshToken();
  }, []);

  useEffect(() => {
    // If refresh token query is successful, set the new credentials
    if (isSuccess && data) {
      dispatch(setCredentials({ ...data }));
      setIsCredentialsSet(true);
    }
  }, [isSuccess, isLoading, isError]);

  return <>{!isCredentialsSet && !isError ? <Loading /> : <Outlet />}</>;
};

export default PersistSignIn;
