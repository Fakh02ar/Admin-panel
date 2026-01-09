import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
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

export async function POST(request) {
  try {
    // Run auth middleware
    authMiddleware(request)

    const data = await request.formData()
    const file = data.get("image")

    if (!file) {
      return Response.json({
        success: false,
        message: "No file uploaded",
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return Response.json({
        success: false,
        message: "Only image files are allowed",
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({
        success: false,
        message: "File size must be less than 5MB",
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const extension = file.name.split(".").pop()
    const filename = `${randomUUID()}.${extension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    return Response.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename,
        path: `/uploads/${filename}`,
        url: `/uploads/${filename}`,
      },
    })

  } catch (error) {
    console.error("Upload error:", error)
    return Response.json({
      success: false,
      message: error.message || "Failed to upload file",
    }, { status: 500 })
  }
}