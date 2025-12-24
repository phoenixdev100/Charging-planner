const mongoose = require('mongoose');

const UtilityDataSchema = new mongoose.Schema({
  // Location Information
  region: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  location_name: String,
  postal_code: String,
  
  // Utility Provider
  utility_provider: {
    name: {
      type: String,
      required: true
    },
    code: String,
    website: String,
    contact: {
      phone: String,
      email: String,
      address: String
    }
  },
  
  // Electricity Rates & Tariffs
  electricity_rates: {
    residential: {
      unit_rate: Number,
      fixed_charge: Number,
      time_of_use: {
        peak: Number,
        off_peak: Number,
        shoulder: Number,
        peak_hours: [String]
      }
    },
    commercial: {
      unit_rate: Number,
      demand_charge: Number,
      fixed_charge: Number,
      time_of_use: {
        peak: Number,
        off_peak: Number,
        shoulder: Number
      }
    },
    industrial: {
      unit_rate: Number,
      demand_charge: Number,
      power_factor_charge: Number
    },
    ev_charging: {
      special_rate: Number,
      time_restricted: Boolean,
      requirements: String
    },
    currency: {
      type: String,
      default: '₹'
    }
  },
  
  // Grid Capacity & Stability
  grid_capacity: {
    total_capacity: Number, // MW
    available_capacity: Number,
    peak_demand: Number,
    capacity_margin: Number, // percentage
    stability_index: {
      type: Number,
      min: 0,
      max: 10
    },
    outage_frequency: {
      annual_count: Number,
      average_duration: Number // hours
    },
    last_major_outage: Date
  },
  
  // Infrastructure Data
  substations: [{
    name: String,
    capacity: Number,
    distance_km: Number,
    voltage_level: String,
    upgrade_planned: Boolean,
    upgrade_year: Number
  }],
  transmission_lines: [{
    voltage: String,
    capacity: Number,
    distance_km: Number,
    age_years: Number
  }],
  
  // Renewable Energy Integration
  renewable_penetration: {
    percentage: Number,
    solar_capacity: Number,
    wind_capacity: Number,
    hydro_capacity: Number,
    storage_capacity: Number
  },
  net_metering: {
    available: Boolean,
    policy: String,
    rate: Number,
    capacity_limit: Number,
    application_process: String
  },
  
  // EV Infrastructure Support
  ev_infrastructure: {
    existing_chargers: Number,
    planned_chargers: Number,
    grid_upgrade_plans: String,
    substation_capacity_for_ev: Number,
    transformer_capacity: Number
  },
  ev_load_management: {
    smart_grid_ready: Boolean,
    load_balancing_available: Boolean,
    v2g_supported: Boolean,
    peak_shaving_programs: Boolean
  },
  
  // Connection Process
  connection_process: {
    application_time: String, // e.g., "2-4 weeks"
    cost: Number,
    requirements: [String],
    documents_required: [String],
    typical_wait_time: String
  },
  permits_required: [{
    permit_type: String,
    agency: String,
    cost: Number,
    timeline: String
  }],
  
  // Government Policies & Incentives
  government_incentives: [{
    program_name: String,
    type: {
      type: String,
      enum: ['subsidy', 'tax_credit', 'rebate', 'grant', 'loan']
    },
    amount: Number,
    eligibility: String,
    valid_until: Date,
    application_process: String
  }],
  ev_policies: [{
    policy_name: String,
    details: String,
    effective_date: Date,
    impact: String
  }],
  
  // Historical Data
  historical_data: {
    consumption_trends: mongoose.Schema.Types.Mixed,
    price_history: [{
      date: Date,
      rate: Number,
      type: String
    }],
    outage_history: [{
      date: Date,
      duration_hours: Number,
      cause: String,
      affected_areas: [String]
    }]
  },
  
  // Forecast & Projections
  future_projects: [{
    project_name: String,
    type: String,
    capacity_increase: Number,
    completion_date: Date,
    impact: String
  }],
  demand_forecast: {
    next_year: Number,
    next_5_years: Number,
    growth_rate: Number
  },
  
  // Data Quality & Source
  data_source: {
    type: String,
    enum: ['utility_company', 'government', 'third_party', 'estimated', 'user_reported'],
    default: 'estimated'
  },
  source_url: String,
  last_updated: {
    type: Date,
    default: Date.now
  },
  update_frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'manual'],
    default: 'manual'
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Geographic Data
  geographic_zone: String,
  climate_zone: String,
  seismic_zone: String,
  
  // Metadata
  notes: String,
  warnings: [String],
  recommendations: [String],
  tags: [String],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  valid_until: Date
});

// Update timestamp before saving
UtilityDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for average residential rate
UtilityDataSchema.virtual('avg_residential_rate').get(function() {
  return this.electricity_rates?.residential?.unit_rate || 0;
});

// Virtual for average commercial rate
UtilityDataSchema.virtual('avg_commercial_rate').get(function() {
  return this.electricity_rates?.commercial?.unit_rate || 0;
});

// Virtual for grid reliability score
UtilityDataSchema.virtual('reliability_score').get(function() {
  const stability = this.grid_capacity?.stability_index || 5;
  const outages = this.grid_capacity?.outage_frequency?.annual_count || 0;
  const duration = this.grid_capacity?.outage_frequency?.average_duration || 0;
  
  let score = stability;
  if (outages > 10) score -= 3;
  else if (outages > 5) score -= 2;
  else if (outages > 0) score -= 1;
  
  if (duration > 24) score -= 3;
  else if (duration > 12) score -= 2;
  else if (duration > 4) score -= 1;
  
  return Math.max(0, Math.min(10, score));
});

// Virtual for connection timeline in days
UtilityDataSchema.virtual('connection_timeline_days').get(function() {
  const timeline = this.connection_process?.application_time;
  if (!timeline) return 30;
  
  const matches = timeline.match(/(\d+)-(\d+)/);
  if (matches) {
    return (parseInt(matches[1]) + parseInt(matches[2])) / 2 * 7; // Convert weeks to days
  }
  return 30; // Default 30 days
});

// Virtual for total incentives available
UtilityDataSchema.virtual('total_incentives').get(function() {
  if (!this.government_incentives) return 0;
  return this.government_incentives.reduce((total, incentive) => {
    return total + (incentive.amount || 0);
  }, 0);
});

// Indexes
UtilityDataSchema.index({ region: 1, state: 1, city: 1 }, { unique: true });
UtilityDataSchema.index({ 'electricity_rates.residential.unit_rate': 1 });
UtilityDataSchema.index({ 'grid_capacity.stability_index': -1 });
UtilityDataSchema.index({ 'utility_provider.name': 1 });
UtilityDataSchema.index({ tags: 1 });
UtilityDataSchema.index({ valid_until: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UtilityData', UtilityDataSchema);