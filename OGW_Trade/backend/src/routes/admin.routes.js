const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, superadminMiddleware } = require('../utils/auth');

router.post('/', authMiddleware, superadminMiddleware, adminController.createAdmin);
router.get('/', authMiddleware, superadminMiddleware, adminController.getAllAdmins);
router.delete('/:id', authMiddleware, superadminMiddleware, adminController.deleteAdmin);

module.exports = router;