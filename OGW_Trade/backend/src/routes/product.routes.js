const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware } = require('../utils/auth');
const upload = require('../config/multer');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', authMiddleware, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.post('/import', authMiddleware, upload.single('file'), productController.importProducts);

module.exports = router;