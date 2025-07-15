const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: "iPhone 14 Pro",
    description: "Latest iPhone with advanced camera system and A16 Bionic chip",
    price: 999.99,
    category: "Electronics",
    stock: 50,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
  },
  {
    name: "Samsung Galaxy S23",
    description: "Flagship Android phone with excellent display and camera",
    price: 899.99,
    category: "Electronics",
    stock: 30,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400"
  },
  {
    name: "MacBook Air M2",
    description: "Lightweight laptop with Apple M2 chip and all-day battery",
    price: 1199.99,
    category: "Electronics",
    stock: 25,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400"
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with Air Max technology",
    price: 150.00,
    category: "Clothing",
    stock: 100,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
  },
  {
    name: "Levi's 501 Jeans",
    description: "Classic straight-fit jeans made from premium denim",
    price: 89.99,
    category: "Clothing",
    stock: 75,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
  },
  {
    name: "The Great Gatsby",
    description: "Classic American novel by F. Scott Fitzgerald",
    price: 12.99,
    category: "Books",
    stock: 200,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
  },
  {
    name: "To Kill a Mockingbird",
    description: "Timeless novel about justice and morality by Harper Lee",
    price: 14.99,
    category: "Books",
    stock: 150,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
  },
  {
    name: "Sony WH-1000XM4",
    description: "Premium noise-canceling wireless headphones",
    price: 349.99,
    category: "Electronics",
    stock: 40,
    image: "https://images.unsplash.com/photo-1505740388908-5e560c06d30e?w=400"
  },
  {
    name: "Adidas Ultraboost 22",
    description: "High-performance running shoes with Boost technology",
    price: 180.00,
    category: "Clothing",
    stock: 60,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
  },
  {
    name: "1984 by George Orwell",
    description: "Dystopian social science fiction novel",
    price: 13.99,
    category: "Books",
    stock: 120,
    image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400"
  }
];

async function insertSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elitestore');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    console.log('Sample data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting sample data:', error);
    process.exit(1);
  }
}

insertSampleData();