import connectDB from "@/lib/connectDB"
import Product from "@/lib/models/Product"

// Middleware functions adapted for Next.js
function authMiddleware(request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    throw new Error("Access denied. No token provided.")
  }

  try {
    const jwt = require("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    request.user = decoded
  } catch (error) {
    throw new Error("Invalid or expired token.")
  }
}

function adminMiddleware(request) {
  if (request.user.role !== "admin") {
    throw new Error("Access denied. Admin only.")
  }
}

export async function GET(request) {
  try {
    await connectDB()

    // Run auth middleware
    authMiddleware(request)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page")) || 1
    const limit = parseInt(searchParams.get("limit")) || 10
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const sort = searchParams.get("sort") || "newest"

    const query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    if (category && category !== "all") {
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
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    return Response.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Get products error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to fetch products",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    // Run auth and admin middleware
    authMiddleware(request)
    adminMiddleware(request)

    const { title, description, price, image, category, status } = await request.json()

    // Validation
    if (!title || !description || !price || !category) {
      return Response.json({
        success: false,
        message: "Please provide all required fields",
      }, { status: 400 })
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price: parseFloat(price),
      image: image || "",
      category,
      status: status || "active",
    })

    // Populate category
    await product.populate("category", "name")

    return Response.json({
      success: true,
      data: product,
    }, { status: 201 })

  } catch (error) {
    console.error("Create product error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to create product",
    }, { status: 500 })
  }
}