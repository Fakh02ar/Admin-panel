import connectDB from "@/lib/connectDB"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
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

export async function PUT(request, { params }) {
  try {
    await connectDB()

    // Run auth and admin middleware
    authMiddleware(request)
    adminMiddleware(request)

    const { id } = params
    const { name, email, password, role } = await request.json()

    // Validation
    if (!name || !email) {
      return Response.json({
        success: false,
        message: "Please provide name and email",
      }, { status: 400 })
    }

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return Response.json({
          success: false,
          message: "Email already taken",
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData = { name, email, role: role || "user" }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })

    return Response.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    })

  } catch (error) {
    console.error("Update user error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to update user",
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    // Run auth and admin middleware
    authMiddleware(request)
    adminMiddleware(request)

    const { id } = params

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      }, { status: 404 })
    }

    // Prevent deleting self
    if (request.user.userId === id) {
      return Response.json({
        success: false,
        message: "Cannot delete your own account",
      }, { status: 400 })
    }

    // Delete user
    await User.findByIdAndDelete(id)

    return Response.json({
      success: true,
      message: "User deleted successfully",
    })

  } catch (error) {
    console.error("Delete user error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to delete user",
    }, { status: 500 })
  }
}