const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Residential', 'Commercial', 'Public', 'Highway', 'Workplace', 'Retail'],
    default: 'Commercial'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
      default: 19.0760 // Mumbai default
    },
    lng: {
      type: Number,
      required: true,
      default: 72.8777 // Mumbai default
    }
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  complexity: {
    type: String,
    enum: ['simple', 'medium', 'complex', 'very_complex'],
    default: 'medium'
  },
  estimated_usage: {
    daily_vehicles: {
      type: Number,
      min: 0,
      default: 10
    },
    peak_hours: [{
      type: Number,
      min: 0,
      max: 23
    }]
  },
  grid_capacity: {
    available_power: String,
    outage_risk: String,
    upgrade_required: Boolean,
    upgrade_cost: Number
  },
  notes: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const AllocationSchema = new mongoose.Schema({
  site_id: mongoose.Schema.Types.ObjectId,
  location: String,
  recommended_charger: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    min: 1,
    default: 1
  },
  allocated_budget: {
    type: Number,
    min: 0,
    required: true
  },
  power_per_unit: Number,
  total_power: Number,
  compatible_ports: [String],
  installation_timeline: {
    type: String,
    enum: ['1-2 weeks', '2-4 weeks', '1-2 months', '2+ months'],
    default: '2-4 weeks'
  }
});

const VehicleMixSchema = new mongoose.Schema({
  vehicle_name: String,
  percentage: {
    type: Number,
    min: 0,
    max: 100
  }
});

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  region: {
    type: String,
    required: true,
    enum: ['India', 'USA', 'Europe', 'Other']
  },
  state: String,
  city: String,
  
  // Budget Information
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    default: '₹'
  },
  budget_breakdown: {
    equipment: Number,
    labor: Number,
    materials: Number,
    permits: Number,
    contingency: Number
  },
  
  // Sites Information
  sites: [SiteSchema],
  
  // Optimization Results
  optimization_strategy: {
    type: String,
    enum: ['balanced', 'high_power', 'cost_effective'],
    default: 'balanced'
  },
  vehicle_mix: [VehicleMixSchema],
  allocations: [AllocationSchema],
  
  // ROI Analysis
  roi_analysis: {
    installation_cost: Number,
    daily_profit: Number,
    monthly_profit: Number,
    yearly_profit: Number,
    payback_period_years: Number,
    roi_percentage: Number,
    assumptions: {
      usage_hours_per_day: Number,
      charging_rate_per_kwh: Number,
      electricity_cost_per_kwh: Number,
      charger_power_kw: Number
    }
  },
  
  // Project Status
  status: {
    type: String,
    enum: ['draft', 'planned', 'in_progress', 'completed', 'on_hold', 'cancelled'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Timeline
  start_date: Date,
  estimated_completion_date: Date,
  actual_completion_date: Date,
  
  // Team & Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team_members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin']
    },
    added_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Attachments & Documents
  attachments: [{
    filename: String,
    filepath: String,
    filetype: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reports
  reports: [{
    report_type: String,
    generated_at: Date,
    filepath: String,
    parameters: mongoose.Schema.Types.Mixed
  }],
  
  // Metadata
  tags: [String],
  is_template: {
    type: Boolean,
    default: false
  },
  template_name: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  last_accessed: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update last_accessed when project is fetched
ProjectSchema.pre('findOneAndUpdate', function(next) {
  this.set({ last_accessed: Date.now() });
  next();
});

// Virtual for total allocated budget
ProjectSchema.virtual('total_allocated_budget').get(function() {
  return this.allocations.reduce((total, allocation) => total + allocation.allocated_budget, 0);
});

// Virtual for remaining budget
ProjectSchema.virtual('remaining_budget').get(function() {
  return this.budget - this.total_allocated_budget;
});

// Virtual for total power capacity
ProjectSchema.virtual('total_power_capacity').get(function() {
  return this.allocations.reduce((total, allocation) => total + (allocation.total_power || 0), 0);
});

// Virtual for number of sites
ProjectSchema.virtual('site_count').get(function() {
  return this.sites.length;
});

// Virtual for number of chargers
ProjectSchema.virtual('charger_count').get(function() {
  return this.allocations.reduce((total, allocation) => total + allocation.units, 0);
});

// Enable virtuals in JSON output
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', ProjectSchema);