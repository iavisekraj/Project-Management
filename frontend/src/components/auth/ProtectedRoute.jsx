import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { FullPageSpinner } from "../ui/Spinner.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, bootstrapping, hasRole } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
