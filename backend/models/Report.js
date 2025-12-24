const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // Report Identification
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  report_type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['Feasibility Study', 'Cost Analysis', 'ROI Analysis', 'Site Assessment', 
           'Installation Plan', 'Multi-Site Deployment', 'Progress Report', 
           'Environmental Impact', 'Executive Summary', 'Custom']
  },
  
  // Associated Project
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  project_name: String,
  
  // Report Content
  sections: [{
    title: {
      type: String,
      required: true
    },
    content: String,
    order: Number,
    data: mongoose.Schema.Types.Mixed // Can store charts, tables, etc.
  }],
  
  // Data & Parameters
  parameters: {
    region: String,
    budget: Number,
    sites_count: Number,
    optimization_strategy: String,
    vehicle_mix: mongoose.Schema.Types.Mixed,
    assumptions: mongoose.Schema.Types.Mixed
  },
  
  // Generated Content
  executive_summary: String,
  key_findings: [String],
  recommendations: [{
    text: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    estimated_cost: Number,
    timeline: String
  }],
  charts_data: mongoose.Schema.Types.Mixed,
  tables_data: [{
    title: String,
    headers: [String],
    rows: [[mongoose.Schema.Types.Mixed]]
  }],
  
  // Financial Data
  financial_summary: {
    total_cost: Number,
    breakdown: mongoose.Schema.Types.Mixed,
    roi_analysis: mongoose.Schema.Types.Mixed,
    payback_period: Number,
    npv: Number,
    irr: Number
  },
  
  // Technical Data
  technical_specifications: {
    charger_types: [String],
    total_power: Number,
    electrical_requirements: mongoose.Schema.Types.Mixed,
    installation_timeline: String
  },
  
  // Files & Storage
  file_path: String,
  file_size: Number,
  file_format: {
    type: String,
    enum: ['pdf', 'docx', 'xlsx', 'html', 'json'],
    default: 'pdf'
  },
  generated_files: [{
    format: String,
    path: String,
    size: Number,
    generated_at: Date
  }],
  
  // Access & Sharing
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shared_with: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'download']
    },
    shared_at: {
      type: Date,
      default: Date.now
    }
  }],
  is_public: {
    type: Boolean,
    default: false
  },
  access_token: String,
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previous_version: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  change_log: [{
    version: Number,
    changes: String,
    changed_by: mongoose.Schema.Types.ObjectId,
    changed_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status & Metadata
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'archived'],
    default: 'generating'
  },
  generation_progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  error_message: String,
  tags: [String],
  
  // Timestamps
  generated_at: {
    type: Date,
    default: Date.now
  },
  expires_at: Date,
  viewed_at: Date,
  downloaded_count: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
ReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for download URL
ReportSchema.virtual('download_url').get(function() {
  return `/api/reports/download/${this._id}`;
});

// Virtual for share URL
ReportSchema.virtual('share_url').get(function() {
  if (this.is_public && this.access_token) {
    return `/shared/report/${this.access_token}`;
  }
  return null;
});

// Virtual for report age
ReportSchema.virtual('age_days').get(function() {
  const now = new Date();
  const generated = new Date(this.generated_at);
  const diffTime = Math.abs(now - generated);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
ReportSchema.index({ project_id: 1, report_type: 1 });
ReportSchema.index({ created_by: 1, generated_at: -1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ tags: 1 });
ReportSchema.index({ is_public: 1, access_token: 1 });
ReportSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', ReportSchema);
