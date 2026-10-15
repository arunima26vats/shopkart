const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get All Products
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    // Search by product name
    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Filter by category
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .select(
        "name description price category image stock createdAt"
      )
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get Single Product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
};