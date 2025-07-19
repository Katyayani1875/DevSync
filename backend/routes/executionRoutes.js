const express = require('express');
const { execute } = require('../controllers/executionController');
const { protect } = require('../middlewares/authMiddleware');
const { executionMethod } = require('../utils/executionService');

const router = express.Router();

router.get('/execute/method', (req, res) => {
  res.json({ method: executionMethod });
});

router.post('/execute', protect, execute);

module.exports = router;