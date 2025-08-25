import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect based on role
    const redirectTo =
      user.role === "system_admin"
        ? "/admin"
        : user.role === "store_owner"
        ? "/stores"
        : "/stores";

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
