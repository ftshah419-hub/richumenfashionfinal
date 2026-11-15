const test = require("node:test");
const assert = require("node:assert/strict");
const ApiError = require("../src/utils/ApiError");
const {
  validateRegistration,
  validateLogin,
  validateChangePassword
} = require("../src/validators/authValidator");

test("registration normalizes email and phone while ignoring an attempted role", () => {
  const input = validateRegistration({
    name: "  RICHU Customer  ",
    email: " CUSTOMER@Example.com ",
    phone: "+91 98765-43210",
    password: "TailoredPass9",
    role: "admin"
  });

  assert.deepEqual(input, {
    name: "RICHU Customer",
    email: "customer@example.com",
    phone: "+919876543210",
    password: "TailoredPass9"
  });
  assert.equal("role" in input, false);
});

test("registration rejects weak passwords", () => {
  assert.throws(
    () => validateRegistration({ name: "John Smith", email: "john@example.com", phone: "+919876543210", password: "password" }),
    (error) => error instanceof ApiError && error.statusCode === 422 && error.details.some(detail => detail.includes("uppercase"))
  );
});

test("login only accepts a string email and password", () => {
  assert.throws(
    () => validateLogin({ email: { $ne: "" }, password: "password" }),
    (error) => error instanceof ApiError && error.statusCode === 422
  );
});

test("password changes require a compliant replacement password", () => {
  assert.throws(
    () => validateChangePassword({ currentPassword: "OldTailor9", newPassword: "short" }),
    (error) => error instanceof ApiError && error.statusCode === 422
  );
});
