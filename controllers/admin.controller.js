const adminService = require("../services/admin.service");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
const registerAdmin = async (req, res) => {
  try {
    const result = await adminService.registerAdmin(req.body);

    if (result.exists) {
      return res.status(400).json({
        success: false,
        message: "Admin already registered with this email or domain",
      });
    }

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: result._id,
        email: result.email,
        domain: result.domain,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= LOGIN ================= */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminService.loginAdmin(email, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔐 JWT मध्ये domain + adminId
    const token = jwt.sign(
      {
        adminId: admin._id,
        domain: admin.domain,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        domain: admin.domain, // 🔥 VERY IMPORTANT
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* ================= PROFILE ================= */
const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin, // comes from auth middleware
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
};
