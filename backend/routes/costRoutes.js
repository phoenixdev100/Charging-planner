const express = require('express');
const router = express.Router();
const costController = require('../controllers/costController');

// Calculate installation cost
router.post('/installation', costController.calculateInstallationCost);

// Calculate ROI
router.post('/roi', costController.calculateROI);

// Get regional multipliers
router.get('/multipliers/:region', costController.getRegionalMultipliers);

module.exports = router;