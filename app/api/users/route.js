import connectDB from "@/lib/connectDB"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

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
    const role = searchParams.get("role") || ""
    const sort = searchParams.get("sort") || "newest"

    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
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
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    return Response.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Get users error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to fetch users",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    // Run auth and admin middleware
    authMiddleware(request)
    adminMiddleware(request)

    const { name, email, password, role } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return Response.json({
        success: false,
        message: "Please provide all required fields",
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({
        success: false,
        message: "User already exists",
      }, { status: 400 })
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

    return Response.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 })

  } catch (error) {
    console.error("Create user error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to create user",
    }, { status: 500 })
  }
}