import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    familyId: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:3002/login",
        formData
      );

      console.log("Login response:", response.data);

      if (response.data.success) {
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
      setMessage("Login failed. Check your credentials.");
    }
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
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {message && (
        <p className={`message ${isError ? "error" : ""}`}>{message}</p>
      )}

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
