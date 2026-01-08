import connectDB from "@/lib/connectDB"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return Response.json({
        success: false,
        message: "Please provide name, email and password",
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({
        success: false,
        message: "User already exists with this email",
      }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Since this is admin panel
    })

    await user.save()

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
    console.error("Register error:", error)
    return Response.json({
      success: false,
      message: error.message || "Registration failed",
    }, { status: 500 })
  }
}