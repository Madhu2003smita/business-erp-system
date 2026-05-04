require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { sendSuccess, sendError } = require("./utils/response");

const app = express();
app.use(cors());
app.use(express.json());


const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp-db";
mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);




app.get("/api/users", authMiddleware, async (req, res, next) => {
  try {
    const users = await User.find();
    sendSuccess(res, "Users fetched successfully", users);
  } catch (err) {
    next(err);
  }
});


app.post("/api/users", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
  try {
    const newUser = new User({ name: req.body.name });
    await newUser.save();
    sendSuccess(res, "User created successfully", newUser, 201);
  } catch (err) {
    next(err);
  }
});


app.delete("/api/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    sendSuccess(res, "User deleted successfully");
  } catch (err) {
    next(err);
  }
});


app.put("/api/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    sendSuccess(res, "User updated successfully", updated);
  } catch (err) {
    next(err);
  }
});


app.use(notFound);


app.use(errorHandler);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
