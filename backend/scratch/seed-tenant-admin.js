require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

const dbURI = process.env.MONGO_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected for seeding.");

    // 1. Clean up previous seed data to make the script idempotent
    await Tenant.deleteOne({ domain: "acme.com" });
    await User.deleteOne({ email: "admin@acme.com" });
    console.log("Cleaned up old seed data.");

    // 2. Create a fake Tenant
    const newTenant = new Tenant({
      name: "Acme Corp",
      domain: "acme.com",
      plan: "enterprise",
    });
    const savedTenant = await newTenant.save();
    console.log(`Tenant created: ${savedTenant.name} (ID: ${savedTenant._id})`);

    // 3. Hash the admin password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 4. Create a new admin User linked to the Tenant
    const newAdmin = new User({
      name: "Acme Admin",
      email: "admin@acme.com",
      password: hashedPassword,
      role: "admin", // Explicitly set the role
      tenantId: savedTenant._id, // Link to the new tenant
    });
    const savedAdmin = await newAdmin.save();
    console.log(`Admin user created: ${savedAdmin.email}`);

    console.log("\nSeed script finished successfully!");
    console.log("Admin User Credentials:");
    console.log("Email: admin@acme.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedDatabase();
