const mongoose = require('mongoose');

const dataFileSchema = new mongoose.Schema({
  originalName: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  fileType: { type: String, required: true, enum: ['csv', 'excel', 'image', 'json', 'other'] },
  category: { type: String, required: true, enum: ['fish_data', 'ocean_data', 'otolith_image', 'eDNA_data', 'other'] },
  filePath: { type: String, required: true },
  processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  validationStatus: { type: String, enum: ['pending', 'valid', 'invalid'], default: 'pending' },
  validationErrors: [{ field: String, message: String, code: String }],
  extractedMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  description: String,
  tags: [String],
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DataFile', dataFileSchema);
