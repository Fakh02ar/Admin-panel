import connectDB from "@/lib/connectDB"
import Product from "@/lib/models/Product"
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
    const { title, description, price, image, category, status } = await request.json()

    // Validation
    if (!title || !description || !price || !category) {
      return Response.json({
        success: false,
        message: "Please provide all required fields",
      }, { status: 400 })
    }

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found",
      }, { status: 404 })
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price: parseFloat(price),
        image: image || "",
        category,
        status: status || "active",
      },
      { new: true }
    ).populate("category", "name")

    return Response.json({
      success: true,
      data: updatedProduct,
    })

  } catch (error) {
    console.error("Update product error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to update product",
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

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found",
      }, { status: 404 })
    }

    // Delete product
    await Product.findByIdAndDelete(id)

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    })

  } catch (error) {
    console.error("Delete product error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to delete product",
    }, { status: 500 })
  }
}