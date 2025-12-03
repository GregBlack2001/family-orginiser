// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Calculate password strength (0-100)
 */
export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

  return Math.min(strength, 100);
};

/**
 * Get password strength label and color
 */
export const getPasswordStrengthLabel = (strength) => {
  if (strength < 30) return { label: "Weak", color: "#e74c3c" };
  if (strength < 60) return { label: "Fair", color: "#f39c12" };
  if (strength < 80) return { label: "Good", color: "#3498db" };
  return { label: "Strong", color: "#00b894" };
};

/**
 * Validate username
 * - 3-20 characters
 * - Only letters, numbers, and underscores
 */
export const validateUsername = (username) => {
  const errors = [];

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  if (username.length > 20) {
    errors.push("Username must be no more than 20 characters long");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Sanitize text input to prevent XSS
 * Removes or escapes potentially dangerous characters
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Validate Family ID format
 */
export const validateFamilyId = (familyId) => {
  const errors = [];

  if (familyId.length < 5) {
    errors.push("Family ID must be at least 5 characters long");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(familyId)) {
    errors.push(
      "Family ID can only contain letters, numbers, underscores, and hyphens"
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const tokenPart = token.replace("Bearer ", "");
    const payload = JSON.parse(atob(tokenPart.split(".")[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
};

/**
 * Clear all auth data from storage
 */
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userrole");
  localStorage.removeItem("userfamily");
};

/**
 * Get time until token expires (in minutes)
 */
export const getTokenExpiryTime = (token) => {
  if (!token) return 0;

  try {
    const tokenPart = token.replace("Bearer ", "");
    const payload = JSON.parse(atob(tokenPart.split(".")[1]));

    if (payload.exp) {
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      const diff = expiryTime - now;
      return Math.max(0, Math.floor(diff / 60000)); // Convert to minutes
    }
    return 0;
  } catch {
    return 0;
  }
};
