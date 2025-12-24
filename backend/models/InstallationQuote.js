const mongoose = require('mongoose');

const InstallationQuoteSchema = new mongoose.Schema({
  // Quote Identification
  quote_number: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  
  // Associated Entities
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  site_id: mongoose.Schema.Types.ObjectId,
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Quote Details
  quote_type: {
    type: String,
    enum: ['standard', 'custom', 'bulk', 'enterprise'],
    default: 'standard'
  },
  scope_of_work: {
    type: String,
    required: true
  },
  assumptions: [String],
  exclusions: [String],
  
  // Charger Details
  chargers: [{
    type: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_price: {
      type: Number,
      required: true,
      min: 0
    },
    specifications: mongoose.Schema.Types.Mixed
  }],
  
  // Cost Breakdown
  cost_breakdown: {
    equipment: {
      amount: Number,
      description: String,
      details: [{
        item: String,
        quantity: Number,
        unit_price: Number,
        total: Number
      }]
    },
    labor: {
      amount: Number,
      description: String,
      man_hours: Number,
      hourly_rate: Number,
      details: [String]
    },
    materials: {
      amount: Number,
      description: String,
      details: [{
        material: String,
        quantity: Number,
        unit_price: Number,
        total: Number
      }]
    },
    permits: {
      amount: Number,
      description: String,
      details: [{
        permit_type: String,
        cost: Number,
        agency: String
      }]
    },
    electrical_work: {
      amount: Number,
      description: String,
      details: [{
        work_type: String,
        cost: Number
      }]
    },
    civil_work: {
      amount: Number,
      description: String,
      details: [{
        work_type: String,
        cost: Number
      }]
    },
    contingency: {
      amount: Number,
      percentage: Number,
      description: String
    },
    taxes: {
      amount: Number,
      rate: Number,
      description: String
    }
  },
  
  // Financial Summary
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxes_amount: {
    type: Number,
    default: 0
  },
  discount: {
    amount: Number,
    percentage: Number,
    reason: String
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: '₹'
  },
  
  // Payment Terms
  payment_terms: {
    deposit_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 30
    },
    deposit_amount: Number,
    milestone_payments: [{
      milestone: String,
      percentage: Number,
      amount: Number,
      due_upon: String
    }],
    final_payment: {
      percentage: Number,
      amount: Number,
      due_days: Number
    },
    payment_methods: [String]
  },
  
  // Timeline
  estimated_timeline: {
    start_date: Date,
    duration_days: Number,
    completion_date: Date,
    milestones: [{
      name: String,
      duration_days: Number,
      description: String
    }]
  },
  
  // Warranty & Support
  warranty: {
    equipment_years: Number,
    labor_years: Number,
    coverage_details: String,
    exclusions: String
  },
  maintenance_plan: {
    included: Boolean,
    duration_months: Number,
    cost: Number,
    services_included: [String]
  },
  support_terms: {
    response_time: String,
    support_hours: String,
    contact_details: String
  },
  
  // Vendor Information
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vendor_company: String,
  vendor_contact: {
    name: String,
    email: String,
    phone: String
  },
  vendor_license: String,
  vendor_insurance: {
    type: String,
    enum: ['valid', 'expired', 'not_provided']
  },
  
  // Customer Information
  customer_details: {
    name: String,
    company: String,
    address: String,
    email: String,
    phone: String,
    tax_id: String
  },
  
  // Site Information
  site_details: {
    address: String,
    contact_person: String,
    access_instructions: String,
    site_conditions: String,
    photos_attached: Boolean
  },
  
  // Approval & Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'reviewed', 'negotiating', 'accepted', 'rejected', 'expired', 'converted_to_project'],
    default: 'draft'
  },
  sent_date: Date,
  viewed_date: Date,
  responded_date: Date,
  accepted_date: Date,
  rejected_date: Date,
  rejection_reason: String,
  expiry_date: {
    type: Date,
    required: true
  },
  
  // Negotiation History
  negotiations: [{
    version: Number,
    changes: String,
    proposed_amount: Number,
    proposed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposed_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'rejected']
    }
  }],
  current_version: {
    type: Number,
    default: 1
  },
  
  // Attachments
  attachments: [{
    filename: String,
    filepath: String,
    description: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Terms & Conditions
  terms_and_conditions: String,
  special_conditions: [String],
  liability_clause: String,
  cancellation_policy: String,
  
  // Metadata
  notes: String,
  internal_notes: String,
  tags: [String],
  
  // Conversion Tracking
  converted_to_project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  conversion_date: Date,
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update timestamp before saving
InstallationQuoteSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Auto-generate quote number if not provided
  if (!this.quote_number) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.quote_number = `EVQ-${year}${month}${day}-${random}`;
  }
  
  next();
});

// Virtual for days until expiry
InstallationQuoteSchema.virtual('days_until_expiry').get(function() {
  if (!this.expiry_date) return null;
  const now = new Date();
  const expiry = new Date(this.expiry_date);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
InstallationQuoteSchema.virtual('is_expired').get(function() {
  if (!this.expiry_date) return false;
  return new Date() > new Date(this.expiry_date);
});

// Virtual for deposit amount
InstallationQuoteSchema.virtual('deposit_amount_calculated').get(function() {
  if (this.payment_terms?.deposit_amount) {
    return this.payment_terms.deposit_amount;
  }
  if (this.payment_terms?.deposit_percentage) {
    return (this.total_amount * this.payment_terms.deposit_percentage) / 100;
  }
  return this.total_amount * 0.3; // Default 30%
});

// Virtual for equipment total
InstallationQuoteSchema.virtual('equipment_total').get(function() {
  if (!this.chargers || this.chargers.length === 0) return 0;
  return this.chargers.reduce((total, charger) => total + charger.total_price, 0);
});

// Indexes
InstallationQuoteSchema.index({ quote_number: 1 }, { unique: true });
InstallationQuoteSchema.index({ project_id: 1 });
InstallationQuoteSchema.index({ customer_id: 1 });
InstallationQuoteSchema.index({ vendor_id: 1 });
InstallationQuoteSchema.index({ status: 1 });
InstallationQuoteSchema.index({ expiry_date: 1 });
InstallationQuoteSchema.index({ created_at: -1 });
InstallationQuoteSchema.index({ total_amount: 1 });

module.exports = mongoose.model('InstallationQuote', InstallationQuoteSchema);