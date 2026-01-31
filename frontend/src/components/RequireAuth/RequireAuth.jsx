import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";

const RequireAuth = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const status = useSelector((state) => {
    return state.auth.status;
  });
  const location = useLocation();

  if (!accessToken || !status || status !== "ACTIVE") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return accessToken ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
