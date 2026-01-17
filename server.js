const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://vc23028-viki.github.io"
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman / no-origin
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Preflight handler (safe)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.sendStatus(200);
  }
  next();
});

// JSON parsing
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/equipment", require("./routes/equipment.routes"));
app.use("/api/production", require("./routes/production_logs.routes"));
app.use("/api/tasks", require("./routes/maintenance_task.routes"));
app.use("/api/schedules", require("./routes/maintenance_schedules.routes"));
app.use("/api/users", require("./routes/users.routes"));

// Test route
app.get("/", (req, res) => res.send("Smart Factory API is running"));

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
