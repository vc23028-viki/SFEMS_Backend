// controllers/auth.controller.js

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/* =========================
   REGISTER USER
========================= */
exports.register = async (req, res) => {
  let { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ✅ normalize role
  role = role.toLowerCase().trim();

  const validRoles = ["admin", "operator", "user"];
  if (!validRoles.includes(role)) {
    return res
      .status(400)
      .json({ message: "Invalid role. Must be admin, operator, or user" });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
      [username, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   LOGIN USER (FIXED)
========================= */
exports.login = async (req, res) => {
  let { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required" });
  }

  // ✅ normalize role from frontend
  role = role.toLowerCase().trim();

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // ✅ normalize role from DB
    const dbRole = user.role.toLowerCase().trim();

    // 🔥 FIXED ROLE CHECK
    if (dbRole !== role) {
      return res.status(401).json({
        message: `This account is registered as ${user.role}. Please select the correct role.`,
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: dbRole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   REQUEST PASSWORD RESET
========================= */
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: "If email exists, reset link will be sent",
      });
    }

    const user = result.rows[0];

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = bcrypt.hashSync(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expiry = $2
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    res.json({
      message: "Password reset link generated",
      token: resetToken, // ⚠ remove in production
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, token, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or token" });
    }

    const user = result.rows[0];

    if (!user.reset_token || !user.reset_token_expiry) {
      return res.status(401).json({ message: "No reset token found" });
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(401).json({ message: "Reset token has expired" });
    }

    const isTokenValid = bcrypt.compareSync(token, user.reset_token);
    if (!isTokenValid) {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};
