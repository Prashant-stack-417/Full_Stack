const express = require("express");
const Product = require("../models/product");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products with pagination, search, and filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Category filter
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Sort options
    let sortOption = {};
    switch (req.query.sort) {
      case "price-low-high":
        sortOption = { price: 1 };
        break;
      case "price-high-low":
        sortOption = { price: -1 };
        break;
      case "name-a-z":
        sortOption = { name: 1 };
        break;
      case "name-z-a":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Get products
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const pages = Math.ceil(total / limit);

    res.json({
      products,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create product (authenticated users only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, image, stock, specifications } =
      req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock,
      specifications,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update product (authenticated users only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = req.body.price;
    if (req.body.image) product.image = req.body.image;
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.specifications !== undefined)
      product.specifications = req.body.specifications;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete product (authenticated users only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
