import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

// Load environment variables
dotenv.config();

// Resolve directory path
const __dirname = path.resolve();

// Assign PORT from environment variables or use default
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3005", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Serve static files for frontend
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// Catch-all route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.message || err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Start server and connect to MongoDB
server.listen(PORT, async () => {
  try {
    await connectToMongoDB();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
});
