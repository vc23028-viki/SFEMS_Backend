const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());  // THIS IS CRUCIAL

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/equipment", require("./routes/equipment.routes"));
app.use("/api/production", require("./routes/production_logs.routes"));
app.use("/api/maintenance", require("./routes/maintenance_task.routes"));
app.use("/api/schedules", require("./routes/maintenance_schedules.routes"));


app.get("/", (req, res) => {
  res.send("Smart Factory API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
