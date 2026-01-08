const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

module.exports = connectDB