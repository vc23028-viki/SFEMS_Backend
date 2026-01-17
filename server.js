// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================================
// CORS Configuration
// ================================
const allowedOrigins = [
  "http://localhost:5173",                  // Local dev
  "https://vc23028-viki.github.io"          // GitHub Pages
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: This origin (${origin}) is not allowed.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests
app.options("*", cors());

// ================================
// Middleware
// ================================
app.use(express.json()); // Parse JSON bodies

// ================================
// Routes
// ================================
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/equipment", require("./routes/equipment.routes"));
app.use("/api/production", require("./routes/production_logs.routes"));
app.use("/api/tasks", require("./routes/maintenance_task.routes"));
app.use("/api/schedules", require("./routes/maintenance_schedules.routes"));
app.use("/api/users", require("./routes/users.routes"));

// ================================
// Test route
// ================================
app.get("/", (req, res) => {
  res.send("Smart Factory API is running");
});

// ================================
// Error Handling
// ================================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ================================
// Start Server
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
