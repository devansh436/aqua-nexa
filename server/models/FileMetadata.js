const mongoose = require('mongoose');

// Dedicated schema for storing detailed metadata
const fileMetadataSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataFile',
    required: true,
    unique: true
  },
  
  // Raw metadata from file processing
  rawMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Processed and structured metadata
  structuredMetadata: {
    // Scientific metadata
    scientificData: {
      experiment: String,
      project: String,
      researcher: String,
      institution: String,
      funding: String,
      doi: String
    },
    
    // Data quality metadata
    qualityMetrics: {
      completeness: Number, // 0-100
      accuracy: Number, // 0-100
      consistency: Number, // 0-100
      validity: Number, // 0-100
      timeliness: Number // 0-100
    },
    
    // Processing metadata
    processingHistory: [{
      operation: String,
      timestamp: Date,
      parameters: mongoose.Schema.Types.Mixed,
      result: String
    }],
    
    // User-provided metadata
    userMetadata: {
      description: String,
      tags: [String],
      notes: String,
      category: String,
      priority: String
    }
  },
  
  // Relationships to other files
  relationships: {
    relatedFiles: [{
      fileId: mongoose.Schema.Types.ObjectId,
      relationship: String, // 'derived_from', 'contains', 'references', etc.
      description: String
    }]
  }
}, {
  timestamps: true
});

fileMetadataSchema.index({ fileId: 1 });
fileMetadataSchema.index({ 'structuredMetadata.userMetadata.tags': 1 });

module.exports = mongoose.model('FileMetadata', fileMetadataSchema);
