import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";

import { useLazyGetRefreshTokenQuery } from "../../redux/apis/auth/refreshTokenAPI";
import { setCredentials } from "../../redux/slices/authSlice";
import Loading from "../Loading/Loading";

const PersistSignIn = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [getRefreshToken, { data, isSuccess, isLoading, isError }] =
    useLazyGetRefreshTokenQuery();

  useEffect(() => {
    if (accessToken) {
      setIsCredentialsSet(true);
      return;
    }

    const fetchRefreshToken = async () => {
      const result = await getRefreshToken();

      if (result?.data) {
        dispatch(setCredentials({ ...result.data }));
        setIsCredentialsSet(true);
      }
    };

    fetchRefreshToken();
  }, [accessToken, dispatch, getRefreshToken]);

  return <>{!isCredentialsSet && !isError ? <Loading /> : <Outlet />}</>;
};

export default PersistSignIn;
