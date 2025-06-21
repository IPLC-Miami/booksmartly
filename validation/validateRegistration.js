const validateRegistration = (email, phoneNumber, password, confirmPassword) => {
  const errors = {};
  let validRegistration = true;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "Email is required.";
    validRegistration = false;
  } else if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address.";
    validRegistration = false;
  }

  // Phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
    validRegistration = false;
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number.";
    validRegistration = false;
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required.";
    validRegistration = false;
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
    validRegistration = false;
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter.";
    validRegistration = false;
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter.";
    validRegistration = false;
  } else if (!/(?=.*\d)/.test(password)) {
    errors.password = "Password must contain at least one number.";
    validRegistration = false;
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
    validRegistration = false;
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
    validRegistration = false;
  }

  return { validRegistration, errors };
};

module.exports = { validateRegistration };