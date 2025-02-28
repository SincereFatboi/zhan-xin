import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import React from "react";

const RequireAuth = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const location = useLocation();

  return accessToken ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
