const ApiError = require("../utils/ApiError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(422, "Validation failed", ["A JSON object is required"]);
  }
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(value, errors) {
  const email = text(value).toLowerCase();
  if (!email) errors.push("Email is required");
  else if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.push("Enter a valid email address");
  return email;
}

function validatePassword(value, errors, field = "Password") {
  if (typeof value !== "string") {
    errors.push(`${field} is required`);
    return "";
  }

  if (value.length < 8 || value.length > 128) {
    errors.push(`${field} must be between 8 and 128 characters`);
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    errors.push(`${field} must include uppercase, lowercase, and a number`);
  }
  return value;
}

function throwIfInvalid(errors) {
  if (errors.length) throw new ApiError(422, "Validation failed", errors);
}

function validateRegistration(body) {
  requireObject(body);
  const errors = [];
  const name = text(body.name);
  const email = validateEmail(body.email, errors);
  const phone = text(body.phone).replace(/[\s()-]/g, "");
  const password = validatePassword(body.password, errors);

  if (name.length < 2 || name.length > 100) errors.push("Name must be between 2 and 100 characters");
  if (!phone) errors.push("Phone number is required");
  else if (!PHONE_PATTERN.test(phone)) errors.push("Enter a valid phone number");

  throwIfInvalid(errors);
  return { name, email, phone, password };
}

function validateLogin(body) {
  requireObject(body);
  const errors = [];
  const email = validateEmail(body.email, errors);
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) errors.push("Password is required");
  throwIfInvalid(errors);
  return { email, password };
}

function validateChangePassword(body) {
  requireObject(body);
  const errors = [];
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  if (!currentPassword) errors.push("Current password is required");
  const newPassword = validatePassword(body.newPassword, errors, "New password");
  throwIfInvalid(errors);
  return { currentPassword, newPassword };
}

module.exports = { validateRegistration, validateLogin, validateChangePassword };
