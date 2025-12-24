const Charger = require('../models/Charger');

// Regional cost multipliers
const REGIONAL_MULTIPLIERS = {
  "India": { labor: 0.3, materials: 0.7, permits: 0.5 },
  "USA": { labor: 1.0, materials: 1.0, permits: 1.0 },
  "Europe": { labor: 1.2, materials: 1.1, permits: 1.3 }
};

// Complexity factors
const COMPLEXITY_FACTORS = {
  "simple": 0.8,
  "medium": 1.0,
  "complex": 1.5,
  "very_complex": 2.0
};

exports.calculateInstallationCost = async (req, res) => {
  try {
    const { charger_type, quantity = 1, site_complexity = "medium", region = "India" } = req.body;

    // Get charger specs
    const charger = await Charger.findOne({ type: charger_type, region });
    if (!charger) {
      return res.status(404).json({ error: "Charger type not found for this region" });
    }

    const multipliers = REGIONAL_MULTIPLIERS[region] || REGIONAL_MULTIPLIERS["USA"];
    const complexityFactor = COMPLEXITY_FACTORS[site_complexity] || 1.0;

    const { install_cost_range } = charger;
    const base_min = install_cost_range.min;
    const base_max = install_cost_range.max;
    const avg_cost = (base_min + base_max) / 2;

    // Calculate cost breakdown
    const equipment_cost = avg_cost * 0.6 * quantity;
    const labor_cost = avg_cost * 0.25 * multipliers.labor * complexityFactor * quantity;
    const materials_cost = avg_cost * 0.1 * multipliers.materials * complexityFactor * quantity;
    const permits_cost = avg_cost * 0.05 * multipliers.permits * quantity;

    const total_cost = equipment_cost + labor_cost + materials_cost + permits_cost;

    res.json({
      charger_type,
      quantity,
      region,
      site_complexity,
      breakdown: {
        equipment: equipment_cost,
        labor: labor_cost,
        materials: materials_cost,
        permits: permits_cost
      },
      total_cost,
      cost_range: {
        min: total_cost * 0.85,
        max: total_cost * 1.15
      },
      currency: region === "India" ? "₹" : region === "USA" ? "$" : "€"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.calculateROI = async (req, res) => {
  try {
    const {
      installation_cost,
      usage_hours_per_day = 8,
      charging_rate_per_kwh = 15.0,
      electricity_cost_per_kwh = 8.0,
      charger_power = 7.2
    } = req.body;

    // Daily calculations
    const daily_energy = charger_power * usage_hours_per_day;
    const daily_revenue = daily_energy * charging_rate_per_kwh;
    const daily_electricity_cost = daily_energy * electricity_cost_per_kwh;
    const daily_profit = daily_revenue - daily_electricity_cost;

    // Monthly and yearly projections
    const monthly_profit = daily_profit * 30;
    const yearly_profit = daily_profit * 365;

    // ROI calculation
    let payback_period_years = yearly_profit > 0 ? installation_cost / yearly_profit : Infinity;
    let roi_percentage = yearly_profit > 0 ? (yearly_profit / installation_cost) * 100 : -100;

    res.json({
      installation_cost,
      daily_profit,
      monthly_profit,
      yearly_profit,
      payback_period_years,
      roi_percentage,
      assumptions: {
        usage_hours_per_day,
        charging_rate_per_kwh,
        electricity_cost_per_kwh,
        charger_power_kw: charger_power
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRegionalMultipliers = (req, res) => {
  const { region } = req.params;
  const multipliers = REGIONAL_MULTIPLIERS[region] || REGIONAL_MULTIPLIERS["USA"];
  res.json({ region, multipliers });
};