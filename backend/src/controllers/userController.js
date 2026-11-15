const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  res.json({
    success: true,
    data: profile
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user._id, req.body);
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: profile
  });
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getAddresses(req.user._id);
  res.json({
    success: true,
    data: addresses
  });
});

const addAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.addAddress(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: addresses
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.updateAddress(
    req.user._id,
    req.params.addressId,
    req.body
  );
  res.json({
    success: true,
    message: "Address updated successfully",
    data: addresses
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.deleteAddress(
    req.user._id,
    req.params.addressId
  );
  res.json({
    success: true,
    message: "Address deleted successfully",
    data: addresses
  });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.setDefaultAddress(
    req.user._id,
    req.params.addressId
  );
  res.json({
    success: true,
    message: "Default address updated",
    data: addresses
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
