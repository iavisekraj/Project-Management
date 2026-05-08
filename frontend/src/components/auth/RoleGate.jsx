import { useAuth } from "../../context/AuthContext.jsx";

export default function RoleGate({ allow = [], children, fallback = null }) {
  const { hasRole } = useAuth();
  if (!hasRole(...allow)) return fallback;
  return children;
}
