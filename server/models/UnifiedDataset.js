const mongoose = require('mongoose');

const unifiedDatasetSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  composite_key: { type: String, required: true, unique: true },

  fish: [{
    species: String,
    length_cm: Number,
    weight_g: Number,
    abundance: Number,
    age: Number,
    notes: String,
    source_file: String
  }],

  // Keep one “latest ocean state” and optionally a history
  ocean: {
    temperature: Number,
    salinity: Number,
    dissolved_oxygen: Number,
    pH: Number,
    depth_m: Number,
    turbidity: Number,
    notes: String,
    last_updated: Date
  },

  // Optional array to retain multiple near-time ocean readings
  ocean_observations: [{
    time: String, // HH:MM of observation
    temperature: Number,
    salinity: Number,
    dissolved_oxygen: Number,
    pH: Number,
    depth_m: Number,
    turbidity: Number,
    notes: String
  }],

  otolith_features: [{
    image_file: String,
    circularity: Number,
    area: Number,
    perimeter: Number,
    aspect_ratio: Number,
    volume: Number,
    notes: String
  }],

  eDNA: [{
    sequence_id: String,
    matched_species: String,
    notes: String
  }],

  metadata_refs: [{
    file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DataFile' },
    file_name: String,
    data_type: String
  }],

  processing_status: { type: String, default: 'completed' },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

unifiedDatasetSchema.index({ location: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('UnifiedDataset', unifiedDatasetSchema);
