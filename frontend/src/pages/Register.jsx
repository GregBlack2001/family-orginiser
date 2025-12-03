import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  validatePassword,
  validateUsername,
  getPasswordStrength,
  getPasswordStrengthLabel,
} from "../utils/security";
import "./styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    familyId: "",
  });
  const [isNewFamily, setIsNewFamily] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const generateFamilyId = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `family_${randomString}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Update password strength indicator
    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

    // Clear errors when user starts typing
    setValidationErrors([]);
    setMessage("");
    setIsError(false);
  };

  const handleFamilyToggle = (createNew) => {
    setIsNewFamily(createNew);
    if (createNew) {
      setFormData({
        ...formData,
        familyId: generateFamilyId(),
      });
    } else {
      setFormData({
        ...formData,
        familyId: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setValidationErrors([]);

    const errors = [];

    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.push(...usernameValidation.errors);
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    // If there are validation errors, display them
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3002/register", {
        username: formData.username,
        password: formData.password,
        familyId: formData.familyId,
      });

      if (response.data.success) {
        const familyMsg = isNewFamily
          ? `Your Family ID is: ${formData.familyId} - Share this with family members!`
          : "";

        setMessage(
          `Registration successful! ${familyMsg} Redirecting to login...`
        );

        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
    } catch (error) {
      setIsError(true);
      if (error.response?.data?.msg) {
        setMessage(error.response.data.msg);
      } else {
        setMessage("Registration failed. Please try again.");
      }
      console.error(error);
    }
  };

  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="register-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="3-20 characters, letters/numbers/underscores"
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
            placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
            required
          />
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: strengthInfo.color,
                  }}
                ></div>
              </div>
              <span
                className="strength-label"
                style={{ color: strengthInfo.color }}
              >
                {strengthInfo.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />
          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <small className="password-mismatch">
                Passwords do not match
              </small>
            )}
        </div>

        <div className="family-toggle">
          <label>Family Options</label>
          <div>
            <button
              type="button"
              onClick={() => handleFamilyToggle(true)}
              className={isNewFamily ? "active" : ""}
            >
              Create New Family
            </button>
            <button
              type="button"
              onClick={() => handleFamilyToggle(false)}
              className={!isNewFamily ? "active" : ""}
            >
              Join Existing Family
            </button>
          </div>
        </div>

        <div className="family-id-section">
          <label htmlFor="familyId">Family ID</label>
          <input
            type="text"
            id="familyId"
            name="familyId"
            value={formData.familyId}
            onChange={handleChange}
            placeholder={
              isNewFamily ? "Auto-generated" : "Enter family ID from a member"
            }
            readOnly={isNewFamily}
            required
          />
          {isNewFamily && (
            <small>Save this ID to share with your family members!</small>
          )}
        </div>

        <button type="submit">Register</button>
      </form>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className={`message ${isError ? "error" : ""}`}>{message}</p>
      )}

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
