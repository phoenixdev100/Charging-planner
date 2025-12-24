const Project = require('../models/Project');
const Charger = require('../models/Charger');
const Vehicle = require('../models/Vehicle');
const axios = require('axios');

// Regional data (similar to INDIA_DATA in Python)
const REGIONAL_DATA = {
  "India": {
    states: {
      "Maharashtra": {
        cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
        utility_provider: "MSEDCL",
        api_endpoint: process.env.UTILITY_API_MSEDCL
      },
      "Delhi": {
        cities: ["New Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad"],
        utility_provider: "BSES",
        api_endpoint: process.env.UTILITY_API_BSES
      },
      "Karnataka": {
        cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
        utility_provider: "BESCOM",
        api_endpoint: process.env.UTILITY_API_BESCOM
      },
      "Tamil Nadu": {
        cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
        utility_provider: "TANGEDCO",
        api_endpoint: process.env.UTILITY_API_TANGEDCO
      },
      "Gujarat": {
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
        utility_provider: "GUVNL",
        api_endpoint: process.env.UTILITY_API_GUVNL
      }
    },
    top_cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"]
  },
  "USA": {
    states: {
      "California": {
        cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
        utility_provider: "PG&E",
        api_endpoint: process.env.UTILITY_API_PGE
      },
      "Texas": {
        cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
        utility_provider: "ERCOT",
        api_endpoint: process.env.UTILITY_API_ERCOT
      },
      "New York": {
        cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
        utility_provider: "ConEdison",
        api_endpoint: process.env.UTILITY_API_CONED
      }
    },
    top_cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
  },
  "Europe": {
    states: {
      "Germany": {
        cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
        utility_provider: "E.ON",
        api_endpoint: process.env.UTILITY_API_EON
      },
      "France": {
        cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
        utility_provider: "EDF",
        api_endpoint: process.env.UTILITY_API_EDF
      },
      "UK": {
        cities: ["London", "Manchester", "Birmingham", "Liverpool", "Glasgow"],
        utility_provider: "National Grid",
        api_endpoint: process.env.UTILITY_API_NATIONALGRID
      }
    },
    top_cities: ["London", "Berlin", "Paris", "Madrid", "Rome"]
  }
};

exports.singleSitePlanning = async (req, res) => {
  try {
    const { site_location, site_type, selected_vehicles, region } = req.body;

    // Get vehicle data
    const vehicles = await Vehicle.find({ 
      name: { $in: selected_vehicles },
      region
    });

    if (vehicles.length === 0) {
      return res.status(404).json({ error: "No vehicles found for the selected region" });
    }

    // Get compatible ports
    const compatiblePorts = [...new Set(vehicles.map(v => v.charge_port))];

    // Find compatible chargers
    const compatibleChargers = await Charger.find({
      region,
      compatible_ports: { $in: compatiblePorts }
    });

    // Get load capacity information
    const loadCapacity = await this.getLoadCapacityData(region, site_location);

    res.json({
      site_location,
      site_type,
      vehicles: vehicles.map(v => ({
        name: v.name,
        charge_port: v.charge_port,
        range: v.range,
        battery_capacity: v.battery_capacity
      })),
      compatible_ports: compatiblePorts,
      compatible_chargers,
      load_capacity: loadCapacity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.optimizeMultiSite = async (req, res) => {
  try {
    const { sites, budget, vehicle_mix, strategy = "balanced", region } = req.body;

    if (!sites || sites.length === 0) {
      return res.status(400).json({ error: "No sites provided" });
    }

    // Get vehicle port distribution
    const portDistribution = await this.calculatePortDistribution(vehicle_mix, region);

    // Implement optimization strategies
    let result;
    switch (strategy) {
      case "balanced":
        result = await this.balancedStrategy(sites, budget, portDistribution, region);
        break;
      case "high_power":
        result = await this.highPowerStrategy(sites, budget, portDistribution, region);
        break;
      case "cost_effective":
        result = await this.costEffectiveStrategy(sites, budget, portDistribution, region);
        break;
      default:
        return res.status(400).json({ error: "Invalid optimization strategy" });
    }

    res.json({
      strategy,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveProject = async (req, res) => {
  try {
    // Authentication check
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const projectData = {
      ...req.body,
      createdBy: req.userId
    };
    
    const project = new Project(projectData);
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    // Authentication check
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const projects = await Project.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    // Authentication check
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    // Authentication check
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRegions = (req, res) => {
  res.json(Object.keys(REGIONAL_DATA));
};

// NEW: Get states for a region
exports.getStatesByRegion = (req, res) => {
  const { region } = req.params;
  
  if (!REGIONAL_DATA[region]) {
    return res.status(404).json({ error: 'Region not found' });
  }
  
  const states = Object.keys(REGIONAL_DATA[region].states || {});
  res.json(states);
};

exports.getCitiesByRegion = (req, res) => {
  const { region } = req.params;
  const { state } = req.query;
  
  if (!REGIONAL_DATA[region]) {
    return res.status(404).json({ error: 'Region not found' });
  }
  
  if (state && REGIONAL_DATA[region].states[state]) {
    return res.json(REGIONAL_DATA[region].states[state].cities);
  }
  
  res.json(REGIONAL_DATA[region].top_cities || []);
};

exports.getLoadCapacity = async (req, res) => {
  try {
    const { region, location } = req.params;
    const loadCapacity = await this.getLoadCapacityData(region, location);
    res.json(loadCapacity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper methods
exports.getLoadCapacityData = async (region, location) => {
  try {
    // Try to find state-specific API
    const state = this.findStateForLocation(region, location);
    if (state && REGIONAL_DATA[region]?.states[state]?.api_endpoint) {
      const apiEndpoint = REGIONAL_DATA[region].states[state].api_endpoint;
      
      // Skip example endpoints
      if (apiEndpoint && !apiEndpoint.includes('example.com')) {
        const response = await axios.get(`${apiEndpoint}/capacity`, {
          params: {
            api_key: process.env.UTILITY_API_KEY,
            location
          },
          timeout: 8000
        });
        
        if (response.status === 200) {
          return response.data;
        }
      }
    }
    
    // Fallback to estimated values based on region
    const fallbackData = {
      "India": {
        capacity: "Estimated 80kW",
        outage_risk: "Medium",
        peak_hours: [18, 19, 20, 21]
      },
      "USA": {
        capacity: "Estimated 150kW",
        outage_risk: "Low",
        peak_hours: [17, 18, 19]
      },
      "Europe": {
        capacity: "Estimated 120kW",
        outage_risk: "Low",
        peak_hours: [18, 19, 20]
      }
    };
    
    return fallbackData[region] || {
      capacity: "Estimated 100kW",
      outage_risk: "Unknown",
      peak_hours: []
    };
  } catch (error) {
    console.error('Load capacity API error:', error.message);
    return {
      capacity: "Estimated 100kW",
      outage_risk: "Unknown",
      peak_hours: []
    };
  }
};

exports.findStateForLocation = (region, location) => {
  if (!REGIONAL_DATA[region]) return null;
  
  const locationLower = location.toLowerCase();
  const states = REGIONAL_DATA[region].states || {};
  
  for (const [state, data] of Object.entries(states)) {
    const cityMatch = data.cities.some(city => 
      locationLower.includes(city.toLowerCase()) || 
      city.toLowerCase().includes(locationLower)
    );
    
    if (cityMatch) {
      return state;
    }
  }
  
  return null;
};

exports.calculatePortDistribution = async (vehicleMix, region) => {
  const portCounts = {};
  let total = 0;
  
  // Get vehicle data
  const vehicleNames = Object.keys(vehicleMix);
  const vehicles = await Vehicle.find({ name: { $in: vehicleNames }, region });
  
  // Create a map for quick lookup
  const vehicleMap = {};
  vehicles.forEach(v => vehicleMap[v.name] = v.charge_port);
  
  // Calculate distribution
  for (const [vehicleName, percentage] of Object.entries(vehicleMix)) {
    const port = vehicleMap[vehicleName];
    if (port) {
      portCounts[port] = (portCounts[port] || 0) + percentage;
      total += percentage;
    }
  }
  
  // Convert to percentages
  const distribution = {};
  for (const [port, count] of Object.entries(portCounts)) {
    distribution[port] = total > 0 ? count / total : 0;
  }
  
  return distribution;
};

exports.balancedStrategy = async (sites, budget, portDistribution, region) => {
  const siteCount = sites.length;
  if (siteCount === 0) {
    return { error: "No sites available" };
  }
  
  const budgetPerSite = budget / siteCount;
  const allocations = [];
  
  for (const site of sites) {
    // Select charger type based on budget and port compatibility
    const chargerType = await this.selectChargerType(budgetPerSite, portDistribution, region);
    const charger = await Charger.findOne({ type: chargerType, region });
    
    if (!charger) continue;
    
    const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
    const units = Math.max(1, Math.floor(budgetPerSite / avgCost));
    
    allocations.push({
      site_id: site.id || site._id,
      location: site.location,
      recommended_charger: chargerType,
      units,
      allocated_budget: units * avgCost,
      compatible_ports: charger.compatible_ports,
      power_per_unit: charger.power,
      total_power: units * charger.power
    });
  }
  
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_budget, 0);
  const totalPower = allocations.reduce((sum, a) => sum + a.total_power, 0);
  
  return {
    allocations,
    total_budget: budget,
    remaining_budget: budget - totalAllocated,
    total_power: totalPower,
    average_power_per_site: totalPower / siteCount
  };
};

// NEW: High Power Strategy Implementation
exports.highPowerStrategy = async (sites, budget, portDistribution, region) => {
  if (sites.length === 0) {
    return { error: "No sites available" };
  }
  
  const allocations = [];
  let remainingBudget = budget;
  
  // Sort sites by priority (higher priority first)
  const sortedSites = [...sites].sort((a, b) => 
    (b.priority || 5) - (a.priority || 5)
  );
  
  // Get all available chargers for the region, sorted by power (highest first)
  const allChargers = await Charger.find({ region }).sort({ power: -1 });
  
  for (const site of sortedSites) {
    if (remainingBudget <= 0) break;
    
    // Find the most powerful charger that fits the remaining budget
    let selectedCharger = null;
    let maxUnits = 0;
    
    for (const charger of allChargers) {
      const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
      
      const keys = Object.keys(portDistribution);
      const mostCommonPort = keys.length
        ? keys.reduce((a, b) => (portDistribution[a] > portDistribution[b] ? a : b))
        : null;
      if (mostCommonPort && !charger.compatible_ports.includes(mostCommonPort)) continue;
      
      const maxPossibleUnits = Math.min(
        3, // Max 3 units per site for high-power strategy
        Math.floor(remainingBudget / avgCost)
      );
      
      if (maxPossibleUnits > 0 && maxPossibleUnits > maxUnits) {
        selectedCharger = charger;
        maxUnits = maxPossibleUnits;
      }
    }
    
    if (selectedCharger && maxUnits > 0) {
      const avgCost = (selectedCharger.install_cost_range.min + selectedCharger.install_cost_range.max) / 2;
      const siteCost = maxUnits * avgCost;
      remainingBudget -= siteCost;
      
      allocations.push({
        site_id: site.id || site._id,
        location: site.location,
        recommended_charger: selectedCharger.type,
        units: maxUnits,
        allocated_budget: siteCost,
        compatible_ports: selectedCharger.compatible_ports,
        power_per_unit: selectedCharger.power,
        total_power: maxUnits * selectedCharger.power
      });
    }
  }
  
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_budget, 0);
  const totalPower = allocations.reduce((sum, a) => sum + a.total_power, 0);
  
  return {
    allocations,
    total_budget: budget,
    remaining_budget: remainingBudget,
    total_power: totalPower,
    average_power_per_site: allocations.length > 0 ? totalPower / allocations.length : 0,
    sites_covered: allocations.length,
    total_sites: sites.length
  };
};

// NEW: Cost Effective Strategy Implementation
exports.costEffectiveStrategy = async (sites, budget, portDistribution, region) => {
  if (sites.length === 0) {
    return { error: "No sites available" };
  }
  
  // Get the most cost-effective charger (lowest cost per kW)
  const allChargers = await Charger.find({ region });
  
  // Calculate cost per kW for each charger
  const chargersWithCostPerKw = allChargers.map(charger => {
    const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
    const costPerKw = avgCost / charger.power;
    return { ...charger.toObject(), costPerKw, avgCost };
  });
  
  // Sort by cost per kW (lowest first)
  chargersWithCostPerKw.sort((a, b) => a.costPerKw - b.costPerKw);
  
  // Find the most cost-effective charger that's compatible with the most common port
  let selectedCharger = null;
  const mostCommonPort = Object.keys(portDistribution).reduce((a, b) => 
    portDistribution[a] > portDistribution[b] ? a : b, 
    Object.keys(portDistribution)[0]
  );
  
  for (const charger of chargersWithCostPerKw) {
    if (charger.compatible_ports.includes(mostCommonPort)) {
      selectedCharger = charger;
      break;
    }
  }
  
  // Fallback to any charger if none are compatible
  if (!selectedCharger && chargersWithCostPerKw.length > 0) {
    selectedCharger = chargersWithCostPerKw[0];
  }
  
  if (!selectedCharger) {
    return { error: "No compatible chargers found" };
  }
  
  // Calculate how many sites we can cover
  const maxUnitsPerSite = 2; // For cost-effective, limit to 2 units per site
  const unitsPerSite = Math.min(
    maxUnitsPerSite,
    Math.max(1, Math.floor(budget / (sites.length * selectedCharger.avgCost)))
  );
  
  const sitesToCover = Math.min(
    sites.length,
    Math.floor(budget / (unitsPerSite * selectedCharger.avgCost))
  );
  
  const allocations = [];
  
  for (let i = 0; i < sitesToCover; i++) {
    const site = sites[i];
    const siteCost = unitsPerSite * selectedCharger.avgCost;
    
    allocations.push({
      site_id: site.id || site._id,
      location: site.location,
      recommended_charger: selectedCharger.type,
      units: unitsPerSite,
      allocated_budget: siteCost,
      compatible_ports: selectedCharger.compatible_ports,
      power_per_unit: selectedCharger.power,
      total_power: unitsPerSite * selectedCharger.power
    });
  }
  
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_budget, 0);
  const totalPower = allocations.reduce((sum, a) => sum + a.total_power, 0);
  
  return {
    allocations,
    total_budget: budget,
    remaining_budget: budget - totalAllocated,
    total_power: totalPower,
    average_power_per_site: unitsPerSite * selectedCharger.power,
    sites_covered: sitesToCover,
    total_sites: sites.length,
    coverage_percentage: (sitesToCover / sites.length) * 100
  };
};

exports.selectChargerType = async (budget, portDistribution, region) => {
  // Get all chargers for the region
  const chargers = await Charger.find({ region });
  
  if (chargers.length === 0) {
    return "Level 2 (240V)"; // Default fallback
  }
  
  // Find the most common port
  const mostCommonPort = Object.keys(portDistribution).reduce((a, b) => 
    portDistribution[a] > portDistribution[b] ? a : b, 
    Object.keys(portDistribution)[0]
  );
  
  // Filter compatible chargers
  const compatibleChargers = chargers.filter(charger => 
    charger.compatible_ports.includes(mostCommonPort)
  );
  
  if (compatibleChargers.length === 0) {
    // No compatible chargers, return most powerful affordable charger
    const affordableChargers = chargers.filter(charger => {
      const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
      return avgCost <= budget;
    });
    
    affordableChargers.sort((a, b) => b.power - a.power);
    return affordableChargers[0]?.type || "Level 2 (240V)";
  }
  
  // Find the most powerful affordable compatible charger
  compatibleChargers.sort((a, b) => b.power - a.power);
  
  for (const charger of compatibleChargers) {
    const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
    if (avgCost <= budget) {
      return charger.type;
    }
  }
  
  // If no affordable compatible charger, return the cheapest compatible one
  compatibleChargers.sort((a, b) => {
    const avgCostA = (a.install_cost_range.min + a.install_cost_range.max) / 2;
    const avgCostB = (b.install_cost_range.min + b.install_cost_range.max) / 2;
    return avgCostA - avgCostB;
  });
  
  return compatibleChargers[0]?.type || "Level 2 (240V)";
};

// NEW: Get charger recommendations based on vehicle mix
exports.getChargerRecommendations = async (req, res) => {
  try {
    const { vehicle_mix, region, budget_constraint } = req.body;
    
    if (!vehicle_mix || Object.keys(vehicle_mix).length === 0) {
      return res.status(400).json({ error: "Vehicle mix required" });
    }
    
    const portDistribution = await this.calculatePortDistribution(vehicle_mix, region);
    const chargers = await Charger.find({ region });
    
    // Calculate score for each charger based on compatibility and cost
    const chargerScores = chargers.map(charger => {
      let compatibilityScore = 0;
      
      // Calculate compatibility with port distribution
      for (const [port, percentage] of Object.entries(portDistribution)) {
        if (charger.compatible_ports.includes(port)) {
          compatibilityScore += percentage;
        }
      }
      
      const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
      const costPerKw = avgCost / charger.power;
      
      // Normalize scores (higher compatibility, lower cost per kW is better)
      const normalizedCompatibility = compatibilityScore;
      const normalizedCost = budget_constraint ? 
        Math.max(0, 1 - (avgCost / budget_constraint)) : 
        1 / costPerKw;
      
      const totalScore = (normalizedCompatibility * 0.6) + (normalizedCost * 0.4);
      
      return {
        charger: charger,
        compatibility_score: compatibilityScore,
        cost_per_kw: costPerKw,
        total_score: totalScore,
        affordable: budget_constraint ? avgCost <= budget_constraint : true
      };
    });
    
    // Sort by total score
    chargerScores.sort((a, b) => b.total_score - a.total_score);
    
    res.json({
      port_distribution: portDistribution,
      recommendations: chargerScores.map(score => ({
        type: score.charger.type,
        power: score.charger.power,
        compatibility_score: score.compatibility_score,
        cost_per_kw: score.cost_per_kw,
        average_cost: (score.charger.install_cost_range.min + score.charger.install_cost_range.max) / 2,
        compatible_ports: score.charger.compatible_ports,
        affordable: score.affordable,
        recommendation_level: score.compatibility_score > 0.7 ? "Highly Recommended" : 
                              score.compatibility_score > 0.4 ? "Recommended" : 
                              "Not Recommended"
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Calculate total installation cost for a project
exports.calculateProjectCost = async (req, res) => {
  try {
    const { allocations, region } = req.body;
    
    if (!allocations || allocations.length === 0) {
      return res.status(400).json({ error: "No allocations provided" });
    }
    
    let totalCost = 0;
    let totalPower = 0;
    const detailedBreakdown = [];
    
    for (const allocation of allocations) {
      const charger = await Charger.findOne({ 
        type: allocation.recommended_charger, 
        region 
      });
      
      if (!charger) {
        continue;
      }
      
      const avgCost = (charger.install_cost_range.min + charger.install_cost_range.max) / 2;
      const siteCost = avgCost * (allocation.units || 1);
      
      totalCost += siteCost;
      totalPower += charger.power * (allocation.units || 1);
      
      detailedBreakdown.push({
        location: allocation.location,
        charger_type: allocation.recommended_charger,
        units: allocation.units || 1,
        cost_per_unit: avgCost,
        total_cost: siteCost,
        power_per_unit: charger.power,
        total_power: charger.power * (allocation.units || 1)
      });
    }
    
    // Apply regional multiplier
    const regionalMultipliers = {
      "India": 1.0,
      "USA": 1.2,
      "Europe": 1.3
    };
    
    const regionalMultiplier = regionalMultipliers[region] || 1.0;
    const adjustedTotalCost = totalCost * regionalMultiplier;
    
    res.json({
      total_cost: totalCost,
      adjusted_total_cost: adjustedTotalCost,
      regional_multiplier: regionalMultiplier,
      total_power: totalPower,
      cost_per_kw: totalPower > 0 ? adjustedTotalCost / totalPower : 0,
      number_of_sites: allocations.length,
      detailed_breakdown: detailedBreakdown,
      currency: region === "India" ? "₹" : region === "USA" ? "$" : "€"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
