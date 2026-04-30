const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes: first verify JWT (authMiddleware), then verify admin role (adminMiddleware)
router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/tasks', authMiddleware, adminMiddleware, adminController.getAllTasks);

module.exports = router;
