const Charger = require('../models/Charger');
const axios = require('axios');

// Configuration
const CONFIG = {
  vendor_api_endpoint: process.env.VENDOR_API_ENDPOINT || "https://ev-vendor-api.example.com/v1/products",
  vendor_api_key: process.env.VENDOR_API_KEY
};

exports.getAllChargers = async (req, res) => {
  try {
    const { region } = req.query;
    const query = region ? { region } : {};
    const chargers = await Charger.find(query);
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChargerByType = async (req, res) => {
  try {
    const charger = await Charger.findOne({ type: req.params.type });
    if (!charger) {
      return res.status(404).json({ error: 'Charger type not found' });
    }
    res.json(charger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompatibleChargers = async (req, res) => {
  try {
    const port = req.params.port;
    const chargers = await Charger.find({ compatible_ports: port });
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchVendorChargers = async (req, res) => {
  try {
    if (!CONFIG.vendor_api_key) {
      return res.status(400).json({ error: 'Vendor API key not configured' });
    }

    const response = await axios.get(
      `${CONFIG.vendor_api_endpoint}/catalog`,
      {
        headers: {
          "Authorization": `Bearer ${CONFIG.vendor_api_key}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    // Process and save vendor chargers
    if (response.data.chargers) {
      for (const [type, specs] of Object.entries(response.data.chargers)) {
        await Charger.findOneAndUpdate(
          { type },
          { ...specs, vendor: 'Vendor API', lastFetched: new Date() },
          { upsert: true, new: true }
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Vendor chargers fetched and updated',
      count: Object.keys(response.data.chargers || {}).length 
    });
  } catch (error) {
    console.error('Vendor API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch vendor chargers', 
      details: error.message 
    });
  }
};

exports.createCharger = async (req, res) => {
  try {
    const charger = new Charger(req.body);
    await charger.save();
    res.status(201).json(charger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!charger) {
      return res.status(404).json({ error: 'Charger not found' });
    }
    res.json(charger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findByIdAndDelete(req.params.id);
    if (!charger) {
      return res.status(404).json({ error: 'Charger not found' });
    }
    res.json({ message: 'Charger deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};