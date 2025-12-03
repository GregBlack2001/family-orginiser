import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Check if token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if token is expired
  try {
    // JWT tokens are in format: Bearer xxxxx.yyyyy.zzzzz
    const tokenPart = token.replace("Bearer ", "");
    const payload = JSON.parse(atob(tokenPart.split(".")[1]));

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired - clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userrole");
      localStorage.removeItem("userfamily");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Invalid token format - clear and redirect
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userrole");
    localStorage.removeItem("userfamily");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
