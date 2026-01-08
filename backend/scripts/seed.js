const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const User = require("../models/User")
const Category = require("../models/Category")
const Product = require("../models/Product")

dotenv.config()

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected")

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})
    console.log("🗑️  Cleared existing data")

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    })
    console.log("👤 Admin user created")

    // Create sample users
    const users = await User.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
    ])
    console.log("👥 Sample users created")

    // Create categories
    const categories = await Category.insertMany([
      { name: "Electronics", status: "active" },
      { name: "Clothing", status: "active" },
      { name: "Books", status: "active" },
      { name: "Home & Garden", status: "active" },
    ])
    console.log("📁 Categories created")

    // Create products
    const products = await Product.insertMany([
      {
        title: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 99.99,
        category: categories[0]._id,
        status: "active",
      },
      {
        title: "Smart Watch",
        description: "Feature-rich smartwatch with fitness tracking",
        price: 249.99,
        category: categories[0]._id,
        status: "active",
      },
      {
        title: "Cotton T-Shirt",
        description: "Comfortable 100% cotton t-shirt",
        price: 19.99,
        category: categories[1]._id,
        status: "active",
      },
      {
        title: "JavaScript Book",
        description: "Complete guide to modern JavaScript",
        price: 39.99,
        category: categories[2]._id,
        status: "active",
      },
    ])
    console.log("📦 Products created")

    console.log("\n✨ Database seeded successfully!")
    console.log("\nAdmin Login Credentials:")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
