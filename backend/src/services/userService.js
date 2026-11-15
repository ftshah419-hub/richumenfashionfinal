const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function getProfile(userId) {
  const user = await User.findById(userId).select(
    "_id name email phone role isEmailVerified accountStatus addresses createdAt updatedAt"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

async function updateProfile(userId, { name, phone }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name && name.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  return getProfile(userId);
}

async function getAddresses(userId) {
  const user = await User.findById(userId).select("addresses");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user.addresses || [];
}

async function addAddress(userId, addressData) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { fullName, phone, street, city, state, pincode, addressType = "HOME", isDefault = false } = addressData;

  if (!fullName || !phone || !street || !city || !state || !pincode) {
    throw new ApiError(400, "All address fields (fullName, phone, street, city, state, pincode) are required");
  }

  // If this is the user's first address or marked default, ensure it is the only default
  const makeDefault = isDefault || (user.addresses && user.addresses.length === 0);

  if (makeDefault && user.addresses) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    fullName: fullName.trim(),
    phone: phone.trim(),
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
    addressType,
    isDefault: makeDefault
  });

  await user.save();
  return user.addresses;
}

async function updateAddress(userId, addressId, addressData) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const { fullName, phone, street, city, state, pincode, addressType, isDefault } = addressData;

  if (fullName) address.fullName = fullName.trim();
  if (phone) address.phone = phone.trim();
  if (street) address.street = street.trim();
  if (city) address.city = city.trim();
  if (state) address.state = state.trim();
  if (pincode) address.pincode = pincode.trim();
  if (addressType) address.addressType = addressType;

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId.toString();
    });
  }

  await user.save();
  return user.addresses;
}

async function deleteAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const wasDefault = user.addresses.some(
    (addr) => addr._id.toString() === addressId.toString() && addr.isDefault
  );

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId.toString()
  );

  // If the deleted address was default, promote the first remaining address to default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
}

async function setDefaultAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const found = user.addresses.id(addressId);
  if (!found) {
    throw new ApiError(404, "Address not found");
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });

  await user.save();
  return user.addresses;
}

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
