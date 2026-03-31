import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checking } = useSelector((state) => state.auth);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[color:var(--neo-muted)]">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
