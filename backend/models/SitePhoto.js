const mongoose = require('mongoose');

const SitePhotoSchema = new mongoose.Schema({
  // Association
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  site_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Photo Details
  filename: {
    type: String,
    required: true
  },
  original_filename: String,
  filepath: {
    type: String,
    required: true
  },
  thumbnail_path: String,
  file_size: {
    type: Number,
    min: 0
  },
  mime_type: {
    type: String,
    default: 'image/jpeg'
  },
  dimensions: {
    width: Number,
    height: Number
  },
  resolution: {
    dpi: Number
  },
  
  // Photo Metadata
  title: String,
  description: String,
  caption: String,
  category: {
    type: String,
    enum: ['exterior', 'interior', 'electrical', 'parking', 'access', 'obstructions', 
           'surroundings', 'utilities', 'other'],
    default: 'other'
  },
  tags: [String],
  
  // Location & Context
  gps_coordinates: {
    latitude: Number,
    longitude: Number,
    altitude: Number
  },
  compass_direction: {
    type: String,
    enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  },
  taken_from: {
    type: String,
    enum: ['ground', 'drone', 'satellite', 'vehicle']
  },
  distance_to_subject: Number, // meters
  
  // Technical Details
  camera_settings: {
    aperture: String,
    shutter_speed: String,
    iso: Number,
    focal_length: String,
    white_balance: String
  },
  camera_model: String,
  lens_model: String,
  
  // Processing Information
  processing_status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  processed_features: [{
    type: String,
    enum: ['3d_reconstruction', 'dimension_extraction', 'obstacle_detection', 
           'space_analysis', 'texture_mapping']
  }],
  processing_metadata: mongoose.Schema.Types.Mixed,
  ai_analysis_results: mongoose.Schema.Types.Mixed,
  
  // 3D Model Association
  point_cloud_path: String,
  mesh_path: String,
  texture_path: String,
  is_3d_reference: {
    type: Boolean,
    default: false
  },
  
  // Access & Permissions
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_private: {
    type: Boolean,
    default: false
  },
  shared_with: [{
    user_id: mongoose.Schema.Types.ObjectId,
    permission: {
      type: String,
      enum: ['view', 'edit', 'delete']
    }
  }],
  
  // Versioning
  versions: [{
    version_number: Number,
    filepath: String,
    changes: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  current_version: {
    type: Number,
    default: 1
  },
  
  // Usage Analytics
  view_count: {
    type: Number,
    default: 0
  },
  download_count: {
    type: Number,
    default: 0
  },
  last_viewed: Date,
  last_downloaded: Date,
  
  // Timestamps
  captured_at: Date,
  uploaded_at: {
    type: Date,
    default: Date.now
  },
  processed_at: Date,
  
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
SitePhotoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for photo URL
SitePhotoSchema.virtual('url').get(function() {
  return `/uploads/site-photos/${this.filepath}`;
});

// Virtual for thumbnail URL
SitePhotoSchema.virtual('thumbnail_url').get(function() {
  return this.thumbnail_path ? `/uploads/thumbnails/${this.thumbnail_path}` : this.url;
});

// Virtual for download URL
SitePhotoSchema.virtual('download_url').get(function() {
  return `/api/photos/download/${this._id}`;
});

// Indexes
SitePhotoSchema.index({ project_id: 1, site_id: 1 });
SitePhotoSchema.index({ category: 1 });
SitePhotoSchema.index({ uploaded_by: 1, uploaded_at: -1 });
SitePhotoSchema.index({ tags: 1 });
SitePhotoSchema.index({ 'gps_coordinates.latitude': 1, 'gps_coordinates.longitude': 1 });
SitePhotoSchema.index({ processing_status: 1 });

module.exports = mongoose.model('SitePhoto', SitePhotoSchema);