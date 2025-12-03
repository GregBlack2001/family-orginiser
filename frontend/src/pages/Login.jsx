import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAuthData } from "../utils/security";
import "./styles/Login.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    familyId: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Handle lockout countdown
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutTime(null);
          setFailedAttempts(0);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error message when user starts typing
    if (message) {
      setMessage("");
      setIsError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Check if user is locked out
    if (lockoutTime && Date.now() < lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      setIsError(true);
      setMessage(`Too many failed attempts. Please wait ${remaining} seconds.`);
      return;
    }

    // Basic validation
    if (
      !formData.username.trim() ||
      !formData.password ||
      !formData.familyId.trim()
    ) {
      setIsError(true);
      setMessage("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Clear any existing auth data before login
      clearAuthData();

      const response = await axios.post(
        "http://localhost:3002/login",
        formData
      );

      if (response.data.success) {
        // Reset failed attempts on successful login
        setFailedAttempts(0);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("userrole", response.data.userrole);
        localStorage.setItem("userfamily", response.data.userfamily);

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.log("Login error:", error.response);
      setIsError(true);

      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      // Lock out after 5 failed attempts for 30 seconds
      if (newFailedAttempts >= 5) {
        setLockoutTime(Date.now() + 30000); // 30 seconds
        setMessage(
          "Too many failed attempts. Please wait 30 seconds before trying again."
        );
      } else {
        const remainingAttempts = 5 - newFailedAttempts;
        if (error.response?.status === 401) {
          setMessage(
            `Invalid credentials. ${remainingAttempts} attempts remaining.`
          );
        } else if (error.response?.status === 403) {
          setMessage(
            "User not found. Please check your username and family ID."
          );
        } else {
          setMessage("Login failed. Please check your credentials.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLockoutRemaining = () => {
    if (!lockoutTime) return 0;
    return Math.max(0, Math.ceil((lockoutTime - Date.now()) / 1000));
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading || lockoutTime}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading || lockoutTime}
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label htmlFor="familyId">Family ID</label>
          <input
            type="text"
            id="familyId"
            name="familyId"
            value={formData.familyId}
            onChange={handleChange}
            placeholder="Enter your family ID"
            disabled={isLoading || lockoutTime}
            required
          />
        </div>

        <button type="submit" disabled={isLoading || lockoutTime}>
          {isLoading
            ? "Logging in..."
            : lockoutTime
            ? `Wait ${getLockoutRemaining()}s`
            : "Login"}
        </button>
      </form>

      {message && (
        <p className={`message ${isError ? "error" : ""}`}>{message}</p>
      )}

      {failedAttempts > 0 && failedAttempts < 5 && !lockoutTime && (
        <p className="attempts-warning">
          {5 - failedAttempts} login attempts remaining
        </p>
      )}

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
