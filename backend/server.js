const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const multer = require("multer")
const path = require("path")
const { authMiddleware } = require("./middleware/auth")

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"))
    }
  },
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/products", require("./routes/products"))
app.use("/api/categories", require("./routes/categories"))

// Image upload route
app.post("/api/upload", authMiddleware, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Admin Panel Backend API", version: "1.0.0" })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
