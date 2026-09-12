import { useAuth } from "../../contexts/AuthContext";
import { Login } from "../../pages/Login";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login />;
  return children;
}