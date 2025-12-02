import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    familyId: "",
  });
  const [isNewFamily, setIsNewFamily] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const generateFamilyId = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `family_${randomString}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    try {
      const response = await axios.post(
        "http://localhost:3002/register",
        formData
      );

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
      setMessage("Registration failed. Please try again.");
      console.error(error);
    }
  };

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

      {message && <p className="message">{message}</p>}

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
