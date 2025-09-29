const mongoose = require('mongoose');

const fileMetadataSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataFile', required: true, unique: true },
  rawMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  structuredMetadata: {
    scientificData: {
      dataType: String,
      recordCount: Number,
      schemaInfo: [String]
    },
    qualityMetrics: {
      completeness: Number,
      accuracy: Number,
      consistency: Number,
      validity: Number,
      timeliness: Number
    },
    processingHistory: [{
      operation: String,
      timestamp: Date,
      parameters: mongoose.Schema.Types.Mixed,
      result: String
    }],
    userMetadata: {
      description: String,
      tags: [String]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('FileMetadata', fileMetadataSchema);
