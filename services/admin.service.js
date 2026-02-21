// admin.service.js (UPDATED)
const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");

/* ================= REGISTER ================= */
const registerAdmin = async (data) => {
  const normalizedDomain = data.domain.toLowerCase().trim();

  const existingAdmin = await Admin.findOne({
    $or: [{ email: data.email }, { domain: normalizedDomain }],
  });

  if (existingAdmin) {
    return { exists: true };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const admin = new Admin({
    mobile: data.mobile,
    email: data.email.toLowerCase(),
    firstName: data.firstName,
    lastName: data.lastName,
    companyName: data.companyName,
    address: data.address,
    domain: normalizedDomain,
    password: hashedPassword,
  });

  await admin.save();
  return admin;
};

/* ================= LOGIN ================= */
const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) return null;

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return null;

  return admin;
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    return { success: false, message: "Admin not found" };
  }

  // 👉 Later you can add OTP / email logic here
  return {
    success: true,
    message: "Admin found. You can reset password now",
    adminId: admin._id,
  };
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (adminId, newPassword) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return { success: false, message: "Invalid admin" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;

  await admin.save();

  return {
    success: true,
    message: "Password reset successfully",
  };
};

module.exports = {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
};
