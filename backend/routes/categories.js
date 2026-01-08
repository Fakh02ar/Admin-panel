const express = require("express")
const Category = require("../models/Category")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")

const router = express.Router()

// Protect all routes with auth
router.use(authMiddleware)

// Get routes don't need admin
// Get categories for dropdown
router.get("/dropdown", async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select("_id name")
      .sort({ name: 1 })

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get all categories
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, status = "", sort = "newest" } = req.query

    const query = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    if (status && status !== "all") {
      query.status = status
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

    const categories = await Category.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Category.countDocuments(query)

    res.json({
      success: true,
      data: categories,
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

// Get single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    res.json({
      success: true,
      data: category,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Create category
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const { name, status } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide category name",
      })
    }

    // Check if category exists
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      })
    }

    const category = await Category.create({
      name,
      status: status || "active",
    })

    res.status(201).json({
      success: true,
      data: category,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Update category
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    res.json({
      success: true,
      data: category,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete category
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
