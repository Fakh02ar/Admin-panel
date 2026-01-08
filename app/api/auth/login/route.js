import connectDB from "@/lib/connectDB"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return Response.json({
        success: false,
        message: "Please provide email and password",
      }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({
        success: false,
        message: "Invalid credentials",
      }, { status: 400 })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return Response.json({
        success: false,
        message: "Invalid credentials",
      }, { status: 400 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "demo_secret_key",
      { expiresIn: "7d" }
    )

    return Response.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

  } catch (error) {
    console.error("Login error:", error)
    return Response.json({
      success: false,
      message: error.message || "Login failed",
    }, { status: 500 })
  }
}