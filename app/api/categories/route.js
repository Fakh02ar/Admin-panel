import connectDB from "@/lib/connectDB"
import Category from "@/lib/models/Category"
import jwt from "jsonwebtoken"

// Middleware functions adapted for Next.js
function authMiddleware(request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    throw new Error("Access denied. No token provided.")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo_secret_key")
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
    const status = searchParams.get("status") || ""
    const sort = searchParams.get("sort") || "newest"

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
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Category.countDocuments(query)

    return Response.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Get categories error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to fetch categories",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    // Run auth and admin middleware
    authMiddleware(request)
    adminMiddleware(request)

    const { name, status } = await request.json()

    // Validation
    if (!name) {
      return Response.json({
        success: false,
        message: "Please provide category name",
      }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return Response.json({
        success: false,
        message: "Category already exists",
      }, { status: 400 })
    }

    // Create category
    const category = await Category.create({
      name,
      status: status || "active",
    })

    return Response.json({
      success: true,
      data: category,
    }, { status: 201 })

  } catch (error) {
    console.error("Create category error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to create category",
    }, { status: 500 })
  }
}