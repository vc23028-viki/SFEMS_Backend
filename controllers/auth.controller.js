const db = require("../config/db");
const bcrypt = require("bcryptjs");

// REGISTER a new user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists (PostgreSQL query with $1 placeholder)
    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(checkUserQuery, [email]);

    if (result.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert new user (PostgreSQL with $1, $2, $3... placeholders and RETURNING id)
    const insertUserQuery = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4) RETURNING id
    `;
    const insertResult = await db.query(insertUserQuery, [
      username,
      email,
      hashedPassword,
      role
    ]);

    res.status(201).json({
      message: "User registered successfully",
      userId: insertResult.rows[0].id  // PostgreSQL returns id in result.rows[0].id
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: "Database error", error: err });
  }
};

// LOGIN user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email (PostgreSQL query with $1 placeholder)
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success, return the user details and role
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: "Database error", error: err });
  }
};
