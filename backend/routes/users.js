const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")

const router = express.Router()

// Protect all routes with auth
router.use(authMiddleware)

// Get routes don't need admin
// Get all users with search and pagination
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, role = "", sort = "newest" } = req.query

    const query = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (role && role !== "all") {
      query.role = role
    }

    let sortOption = { createdAt: -1 } // newest first
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 }
        break
      case "name-asc":
        sortOption = { name: 1 }
        break
      case "name-desc":
        sortOption = { name: -1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    const users = await User.find(query)
      .select("-password")
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Create user
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    })

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Update user
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role
    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    await user.save()

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete user
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
