// backend/routes/roomRoutes.js
const express = require('express');
const { createRoom, getRoomById } = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// protect middleware ensures only logged-in users can access these routes
router.route('/').post(protect, createRoom);
router.route('/:roomId').get(protect, getRoomById);

module.exports = router;