const User = require('../models/User');
const Product = require('../models/Product');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId })
      .populate('cart.productId')
      .populate('favorites')
      .populate('orders');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { telegramId, productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, cart: [] });
    }
    
    const existingItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { telegramId, productId } = req.body;
    
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { telegramId, productId, quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }
    
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const item = user.cart.find(item => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const { telegramId, productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, favorites: [] });
    }
    
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const { telegramId, productId } = req.body;
    
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error });
  }
};