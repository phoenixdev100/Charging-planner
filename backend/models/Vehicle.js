const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    unique: true,
    trim: true
  },
  make: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    min: [2010, 'Year must be 2010 or later'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future']
  },
  variant: String,
  
  // Vehicle Classification
  vehicle_type: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Coupe', 'Convertible', 'Pickup', 'Van', 
           'Two-wheeler', 'Three-wheeler', 'Bus', 'Truck', 'Commercial'],
    default: 'Sedan'
  },
  segment: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Premium', 'Luxury', 'Performance'],
    default: 'Mid-range'
  },
  
  // Battery & Range
  battery_capacity: {
    type: Number,
    required: [true, 'Battery capacity is required'],
    min: [0, 'Battery capacity cannot be negative']
  },
  battery_type: {
    type: String,
    enum: ['Li-ion', 'Li-Po', 'LiFePO4', 'Solid State', 'Other'],
    default: 'Li-ion'
  },
  usable_capacity: {
    type: Number,
    min: [0, 'Usable capacity cannot be negative']
  },
  range: {
    type: Number,
    required: [true, 'Range is required'],
    min: [0, 'Range cannot be negative']
  },
  range_units: {
    type: String,
    enum: ['km', 'miles'],
    default: 'km'
  },
  wltp_range: Number,
  epa_range: Number,
  real_world_range: Number,
  
  // Charging Specifications
  charge_port: {
    type: String,
    required: [true, 'Charge port type is required'],
    enum: ['Type 1', 'Type 2', 'GB/T', 'CCS', 'CHAdeMO', 'CCS2', 'Tesla', 'J1772', 'NACS']
  },
  onboard_charger: {
    power: Number,
    phase: {
      type: String,
      enum: ['Single', 'Three']
    }
  },
  
  // Charging Speeds
  charging_speeds: {
    level_1: {
      time_0_100: Number, // hours
      km_per_hour: Number
    },
    level_2: {
      time_0_100: Number, // hours
      km_per_hour: Number,
      recommended_power: Number // kW
    },
    dc_fast: {
      time_10_80: Number, // minutes
      time_20_80: Number, // minutes
      max_power: Number, // kW
      peak_power: Number // kW
    }
  },
  
  // Performance
  motor_power: {
    type: Number,
    min: [0, 'Motor power cannot be negative']
  },
  torque: Number,
  acceleration_0_100: Number, // seconds
  top_speed: Number,
  efficiency: {
    wh_per_km: Number,
    km_per_kwh: Number,
    miles_per_kwh: Number
  },
  
  // Dimensions & Weight
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    wheelbase: Number
  },
  weight: {
    kerb: Number,
    gross: Number,
    battery_weight: Number
  },
  seating_capacity: {
    type: Number,
    min: [1, 'Seating capacity must be at least 1'],
    default: 5
  },
  boot_space: Number,
  
  // Price & Economics
  price: {
    ex_showroom: Number,
    on_road: Number,
    subsidy_available: Boolean,
    subsidy_amount: Number,
    currency: {
      type: String,
      default: '₹'
    }
  },
  running_cost: {
    cost_per_km: Number,
    annual_maintenance: Number,
    insurance_group: String
  },
  battery_warranty: {
    years: Number,
    kilometers: Number,
    retention: Number // percentage
  },
  vehicle_warranty: {
    years: Number,
    kilometers: Number
  },
  
  // Regional Availability
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: ['India', 'USA', 'Europe', 'China', 'Global'],
    default: 'India'
  },
  available_in_countries: [String],
  launch_date: Date,
  discontinued: {
    type: Boolean,
    default: false
  },
  
  // Market Data
  sales_figures: {
    annual: Number,
    total: Number,
    last_updated: Date
  },
  market_share: {
    type: Number,
    min: [0, 'Market share cannot be negative'],
    max: [100, 'Market share cannot exceed 100%']
  },
  popularity_score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [10, 'Score cannot exceed 10']
  },
  customer_rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Environmental Impact
  carbon_savings: {
    vs_petrol: Number, // tons CO2 per year
    vs_diesel: Number,
    lifetime_savings: Number
  },
  recyclability: {
    type: Number,
    min: [0, 'Recyclability cannot be negative'],
    max: [100, 'Recyclability cannot exceed 100%']
  },
  
  // Features & Technology
  features: [{
    type: String,
    enum: ['Regenerative Braking', 'One-pedal Driving', 'Heat Pump', 'Battery Pre-conditioning',
           'V2L (Vehicle to Load)', 'V2G (Vehicle to Grid)', 'OTA Updates', 'ADAS',
           'Panoramic Sunroof', 'Heated Seats', 'Ventilated Seats', 'Apple CarPlay',
           'Android Auto', '360 Camera', 'Wireless Charging', 'Heated Steering Wheel']
  }],
  connectivity: [{
    type: String,
    enum: ['4G', '5G', 'WiFi Hotspot', 'Bluetooth 5.0', 'NFC']
  }],
  safety_rating: {
    agency: String,
    rating: String,
    year: Number
  },
  
  // Images & Media
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['exterior', 'interior', 'charging', 'dashboard']
    }
  }],
  brochure_url: String,
  review_urls: [String],
  
  // Compatibility
  compatible_chargers: [String],
  recommended_charger_types: [String],
  home_charging_advice: String,
  public_charging_notes: String,
  
  // Updates & Revisions
  facelift_year: Number,
  next_generation_expected: Date,
  
  // Metadata
  tags: [String],
  is_popular: {
    type: Boolean,
    default: false
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_updated_by: String
});

// Update timestamp before saving
VehicleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Virtual for full vehicle name
VehicleSchema.virtual('full_name').get(function() {
  return `${this.make} ${this.model}${this.variant ? ' ' + this.variant : ''}${this.year ? ' (' + this.year + ')' : ''}`;
});

// Virtual for battery warranty status
VehicleSchema.virtual('battery_warranty_status').get(function() {
  if (!this.battery_warranty || !this.battery_warranty.years) return 'Not specified';
  return `${this.battery_warranty.years} years / ${this.battery_warranty.kilometers ? this.battery_warranty.kilometers.toLocaleString() : 'N/A'} km`;
});

// Virtual for charging time estimates
VehicleSchema.virtual('charging_estimates').get(function() {
  return {
    level1_10_90: this.charging_speeds?.level_1?.time_0_100 ? this.charging_speeds.level_1.time_0_100 * 0.8 : null,
    level2_10_90: this.charging_speeds?.level_2?.time_0_100 ? this.charging_speeds.level_2.time_0_100 * 0.8 : null,
    dc_10_80: this.charging_speeds?.dc_fast?.time_10_80 || null
  };
});

// Virtual for cost of ownership
VehicleSchema.virtual('five_year_cost').get(function() {
  if (!this.price?.on_road || !this.running_cost?.cost_per_km) return null;
  const purchaseCost = this.price.on_road;
  const annualKm = 15000; // Average annual kilometers
  const fiveYearRunningCost = this.running_cost.cost_per_km * annualKm * 5;
  const fiveYearMaintenance = (this.running_cost.annual_maintenance || 0) * 5;
  return purchaseCost + fiveYearRunningCost + fiveYearMaintenance;
});

// Indexes for better query performance
VehicleSchema.index({ name: 1 });
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ region: 1, vehicle_type: 1 });
VehicleSchema.index({ charge_port: 1 });
VehicleSchema.index({ range: -1 });
VehicleSchema.index({ battery_capacity: -1 });
VehicleSchema.index({ price: 1 });
VehicleSchema.index({ is_popular: 1, region: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);