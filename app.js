const express = require("express");
const { connectDB } = require("./config/database");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
const basePort = process.env.PORT || 3002;

// Connect to Database
connectDB();

// Middleware for parsing JSON
app.use(express.json());

// Routes
const apiRoutes = require("./app/routes/api");
app.use("/api", apiRoutes);

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(
        `Port ${port} is already in use. Trying port ${port + 1}...`
      );
      startServer(port + 1);
    } else {
      console.error(`Server error: ${err}`);
      process.exit(1);
    }
  });
};

startServer(basePort);
