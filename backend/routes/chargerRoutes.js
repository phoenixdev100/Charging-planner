const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');

// Get all chargers
router.get('/', chargerController.getAllChargers);

// Get charger by type
router.get('/type/:type', chargerController.getChargerByType);

// Get compatible chargers for vehicle port
router.get('/compatible/:port', chargerController.getCompatibleChargers);

// Create new charger (admin)
router.post('/', chargerController.createCharger);

// Update charger
router.put('/:id', chargerController.updateCharger);

// Delete charger
router.delete('/:id', chargerController.deleteCharger);

// Fetch vendor chargers from API
router.get('/vendor/fetch', chargerController.fetchVendorChargers);

module.exports = router;
