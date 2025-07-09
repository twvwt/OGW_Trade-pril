const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/:telegramId', userController.getUserProfile);
router.post('/cart/add', userController.addToCart);
router.post('/cart/remove', userController.removeFromCart);
router.post('/cart/update', userController.updateCartItemQuantity);
router.post('/favorites/add', userController.addToFavorites);
router.post('/favorites/remove', userController.removeFromFavorites);

module.exports = router;