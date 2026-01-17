const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://vc23028-viki.github.io/SFEMS_Frontend/'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());  // THIS IS CRUCIAL

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/equipment", require("./routes/equipment.routes"));
app.use("/api/production", require("./routes/production_logs.routes"));
app.use("/api/tasks", require("./routes/maintenance_task.routes"));  // FIXED: changed from /maintenance to /tasks
app.use("/api/schedules", require("./routes/maintenance_schedules.routes"));
app.use("/api/users", require("./routes/users.routes"));  // ADD THIS - new users route

// Test route
app.get("/", (req, res) => {
  res.send("Smart Factory API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});