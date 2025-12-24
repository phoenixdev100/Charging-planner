// backend/routes/planningRoutes.js - Updated

const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const authMiddleware = require('../middleware/authMiddleware');

// Single site planning
router.post('/single-site', planningController.singleSitePlanning);

// Multi-site planning
router.post('/multi-site/optimize', planningController.optimizeMultiSite);

// NEW: Get charger recommendations
router.post('/charger-recommendations', planningController.getChargerRecommendations);

// NEW: Calculate project cost
router.post('/calculate-project-cost', planningController.calculateProjectCost);

// Create/update project
router.post('/project', authMiddleware, planningController.saveProject);
router.get('/project/:id', planningController.getProject);
router.get('/projects', authMiddleware, planningController.getAllProjects);
router.put('/project/:id', authMiddleware, planningController.updateProject);
router.delete('/project/:id', authMiddleware, planningController.deleteProject);

// Get regional data (public routes)
router.get('/regions', planningController.getRegions);
router.get('/region/:region/states', planningController.getStatesByRegion); // NEW
router.get('/region/:region/cities', planningController.getCitiesByRegion);
router.get('/region/:region/load-capacity/:location', planningController.getLoadCapacity);

module.exports = router;
