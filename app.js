const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const port = 3000;

// Connect to Database
connectDB();

// Middleware for parsing JSON
app.use(express.json());

// Routes
const apiRoutes = require("./app/routes/api");
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
