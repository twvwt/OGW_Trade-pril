const Product = require('../models/Product');
const { parseProductsFromFile } = require('../services/parser.service');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (req.files) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (req.files) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

exports.importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const products = await parseProductsFromFile(req.file.path);
    await Product.insertMany(products);
    
    res.json({ message: 'Products imported successfully', count: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Error importing products', error });
  }
};