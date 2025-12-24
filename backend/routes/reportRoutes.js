const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, reportController.generate);
router.get('/download/:id', authMiddleware, reportController.download);

module.exports = router;
