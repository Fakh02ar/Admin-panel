const express = require("express")
const Product = require("../models/Product")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")

const router = express.Router()

// Protect all routes with auth
router.use(authMiddleware)

// Get routes don't need admin
// Get all products with search and pagination
router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", page = 1, limit = 10, status = "", sort = "newest" } = req.query

    const query = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (category) {
      query.category = category
    }

    if (status && status !== "all") {
      query.status = status
    }

    let sortOption = { createdAt: -1 } // newest first
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 }
        break
      case "price-low":
        sortOption = { price: 1 }
        break
      case "price-high":
        sortOption = { price: -1 }
        break
      case "name-asc":
        sortOption = { title: 1 }
        break
      case "name-desc":
        sortOption = { title: -1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      data: products,
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

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Create product
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const { title, description, price, image, category, status } = req.body

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    const product = await Product.create({
      title,
      description,
      price,
      image,
      category,
      status: status || "active",
    })

    const populatedProduct = await Product.findById(product._id).populate("category", "name")

    res.status(201).json({
      success: true,
      data: populatedProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Update product
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete product
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
