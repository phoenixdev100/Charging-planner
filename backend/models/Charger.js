const mongoose = require('mongoose');

const ChargerSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    required: [true, 'Charger type is required'],
    unique: true,
    enum: ['Level 1 (120V)', 'Level 2 (240V)', 'DC Fast Charger (50kW)', 'DC Fast Charger (150kW)', 
           'DC Fast Charger (350kW)', 'Level 2 Commercial', 'Wallbox', 'Portable']
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Technical Specifications
  power: {
    type: Number,
    required: [true, 'Power rating is required'],
    min: [0, 'Power cannot be negative']
  },
  amps: {
    type: Number,
    required: [true, 'Amperage is required']
  },
  voltage: {
    type: Number,
    required: [true, 'Voltage is required']
  },
  efficiency: {
    type: Number,
    min: [0, 'Efficiency cannot be negative'],
    max: [1, 'Efficiency cannot exceed 1'],
    default: 0.90
  },
  power_factor: {
    type: Number,
    min: [0, 'Power factor cannot be negative'],
    max: [1, 'Power factor cannot exceed 1'],
    default: 0.98
  },
  charging_speed: {
    km_per_hour: Number,
    miles_per_hour: Number,
    battery_percent_per_hour: Number
  },
  
  // Compatibility
  compatible_ports: [{
    type: String,
    enum: ['Type 1', 'Type 2', 'GB/T', 'CCS', 'CHAdeMO', 'CCS2', 'Tesla', 'J1772', 'NACS']
  }],
  compatible_vehicles: [String],
  vehicle_classes: [{
    type: String,
    enum: ['Two-wheeler', 'Passenger Car', 'SUV', 'Commercial Vehicle', 'Bus', 'All']
  }],
  
  // Installation Requirements
  electrical_requirements: {
    phase: {
      type: String,
      enum: ['Single', 'Three', 'DC'],
      default: 'Single'
    },
    minimum_circuit_amps: Number,
    breaker_size: Number,
    wiring_type: String,
    conduit_size: String
  },
  space_requirements: {
    width: Number,
    depth: Number,
    height: Number,
    weight: Number,
    clearance_front: Number,
    clearance_sides: Number
  },
  installation_time: {
    type: String,
    enum: ['<4 hours', '4-8 hours', '1-2 days', '3-5 days', '1+ week']
  },
  
  // Cost Information
  install_cost_range: {
    min: {
      type: Number,
      required: [true, 'Minimum installation cost is required'],
      min: [0, 'Cost cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum installation cost is required'],
      min: [0, 'Cost cannot be negative']
    },
    currency: {
      type: String,
      default: '₹'
    }
  },
  cost_breakdown: {
    equipment_cost: Number,
    installation_labor: Number,
    electrical_work: Number,
    permits_fees: Number,
    taxes: Number
  },
  maintenance_cost: {
    annual: Number,
    per_kwh: Number,
    warranty_years: Number
  },
  operational_cost: {
    electricity_consumption: Number, // kWh per 100km
    demand_charge_impact: Number
  },
  
  // Vendor Information
  vendor: {
    type: String,
    default: 'Standard'
  },
  vendor_id: String,
  manufacturer: String,
  model: String,
  sku: String,
  warranty: {
    years: Number,
    details: String
  },
  lead_time: {
    type: String,
    enum: ['In stock', '1-2 weeks', '2-4 weeks', '1-2 months', '2+ months']
  },
  
  // Features
  features: [{
    type: String,
    enum: ['Smart Charging', 'Load Balancing', 'Remote Monitoring', 'Payment System', 
           'Cable Management', 'LED Lighting', 'Weatherproof', 'Touchscreen', 
           'Mobile App', 'RFID', 'OCPP Compliant', 'V2G Capable']
  }],
  connectivity: [{
    type: String,
    enum: ['WiFi', 'Ethernet', '4G', '5G', 'Bluetooth']
  }],
  certifications: [String],
  
  // Regional Settings
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: ['India', 'USA', 'Europe', 'Global'],
    default: 'India'
  },
  available_in_regions: [String],
  regional_variants: [{
    region: String,
    power_rating: Number,
    voltage: Number,
    cost_adjustment: Number,
    certification: String
  }],
  
  // Performance Metrics
  uptime: {
    type: Number,
    min: [0, 'Uptime cannot be negative'],
    max: [100, 'Uptime cannot exceed 100%'],
    default: 99.5
  },
  lifespan: {
    type: Number,
    default: 10 // years
  },
  reliability_score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [10, 'Score cannot exceed 10']
  },
  
  // Environmental Impact
  carbon_footprint: {
    manufacturing: Number, // kg CO2
    annual_operation: Number, // kg CO2 per year
    recyclability: {
      type: Number,
      min: [0, 'Recyclability cannot be negative'],
      max: [100, 'Recyclability cannot exceed 100%']
    }
  },
  
  // Government & Incentives
  subsidy_eligible: {
    type: Boolean,
    default: false
  },
  subsidies: [{
    region: String,
    program: String,
    amount: Number,
    percentage: Number,
    requirements: String
  }],
  tax_benefits: {
    depreciation_rate: Number,
    tax_credit: Number
  },
  
  // Market Data
  market_penetration: {
    type: Number,
    min: [0, 'Penetration cannot be negative'],
    max: [100, 'Penetration cannot exceed 100%']
  },
  customer_rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  installation_count: {
    type: Number,
    default: 0
  },
  
  // Images & Documentation
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['product', 'installation', 'diagram']
    }
  }],
  datasheet_url: String,
  manual_url: String,
  certification_urls: [String],
  
  // Metadata
  is_active: {
    type: Boolean,
    default: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_fetched: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
ChargerSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Virtual for average cost
ChargerSchema.virtual('average_cost').get(function() {
  return (this.install_cost_range.min + this.install_cost_range.max) / 2;
});

// Virtual for cost per kW
ChargerSchema.virtual('cost_per_kw').get(function() {
  return this.power > 0 ? this.average_cost / this.power : 0;
});

// Virtual for charger level
ChargerSchema.virtual('level').get(function() {
  if (this.type.includes('Level 1')) return 1;
  if (this.type.includes('Level 2')) return 2;
  if (this.type.includes('DC Fast')) return 3;
  return 0;
});

// Virtual for fast charging capability
ChargerSchema.virtual('is_fast_charger').get(function() {
  return this.power >= 50;
});

// Indexes for better query performance
ChargerSchema.index({ type: 1, region: 1 });
ChargerSchema.index({ power: -1 });
ChargerSchema.index({ 'install_cost_range.min': 1 });
ChargerSchema.index({ region: 1, is_active: 1 });
ChargerSchema.index({ compatible_ports: 1 });

module.exports = mongoose.model('Charger', ChargerSchema);