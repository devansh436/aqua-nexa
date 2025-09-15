const mongoose = require('mongoose');

const dataFileSchema = new mongoose.Schema({
  // Basic file information
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  
  // File categorization - Updated with new types
  fileType: {
    type: String,
    required: true,
    enum: ['csv', 'excel', 'netcdf', 'image', 'pdf', 'word', 'text', 'json', 'xml', 'archive', 'table', 'document', 'other']
  },
  category: {
    type: String,
    required: true,
    enum: ['ocean_data', 'fish_data', 'otolith_image', 'research_table', 'document', 'scientific_data', 'other']
  },
  
  // Storage information
  filePath: {
    type: String,
    required: true
  },
  gridfsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  validationStatus: {
    type: String,
    enum: ['pending', 'valid', 'invalid'],
    default: 'pending'
  },
  validationErrors: [{
    field: String,
    message: String,
    code: String
  }],
  
  // Upload metadata
  uploadedBy: {
    type: String,
    default: 'anonymous'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // Complete extracted metadata storage
  extractedMetadata: {
    // Common metadata
    extractedAt: Date,
    fileType: String,
    mimeType: String,
    
    // Image metadata with OCR
    imageInfo: {
      width: Number,
      height: Number,
      format: String,
      hasAlpha: Boolean,
      density: Number,
      colorSpace: String,
      channels: Number,
      size: Number
    },
    
    // OCR extracted text
    extractedText: {
      text: String,
      confidence: Number,
      language: String,
      hasText: Boolean,
      wordCount: Number,
      blocks: [{
        text: String,
        bbox: {
          x0: Number,
          y0: Number,
          x1: Number,
          y1: Number
        },
        confidence: Number
      }]
    },
    
    // CSV metadata
    csvInfo: {
      rows: Number,
      columns: Number,
      headers: [String],
      delimiter: String,
      hasHeaders: Boolean,
      sampleData: [{}],
      columnTypes: {},
      encoding: String,
      error: String
    },
    
    // Excel metadata
    excelInfo: {
      totalSheets: Number,
      format: String,
      hasData: Boolean,
      sheets: [{
        name: String,
        rowCount: Number,
        columnCount: Number,
        hasData: Boolean,
        headers: [String],
        sampleData: [{}]
      }],
      error: String
    },
    
    // PDF metadata
    pdfInfo: {
      pages: Number,
      textLength: Number,
      hasText: Boolean,
      extractedText: String,
      wordCount: Number,
      metadata: {},
      info: {},
      error: String
    },
    
    // Word document metadata
    wordInfo: {
      textLength: Number,
      hasText: Boolean,
      extractedText: String,
      wordCount: Number,
      format: String,
      error: String
    },
    
    // Text file metadata
    textInfo: {
      textLength: Number,
      lineCount: Number,
      wordCount: Number,
      hasContent: Boolean,
      extractedText: String,
      encoding: String,
      error: String
    },
    
    // JSON metadata
    jsonInfo: {
      isValidJSON: Boolean,
      size: Number,
      structure: String,
      hasArrays: Boolean,
      hasObjects: Boolean,
      depth: Number,
      keys: [String],
      error: String
    },
    
    // XML metadata
    xmlInfo: {
      isValidXML: Boolean,
      size: Number,
      rootElement: String,
      elementCount: Number,
      hasAttributes: Boolean,
      error: String
    },
    
    // Archive metadata
    archiveInfo: {
      totalFiles: Number,
      directories: Number,
      files: [{
        name: String,
        size: Number,
        compressed: Number,
        isDirectory: Boolean,
        extension: String
      }],
      totalUncompressedSize: Number,
      totalCompressedSize: Number,
      compressionRatio: Number,
      error: String
    },
    
    // NetCDF metadata
    netcdfInfo: {
      fileSize: Number,
      format: String,
      note: String,
      error: String
    },
    
    // Geographic information
    geoData: {
      coordinates: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number]
        }
      },
      location: String,
      region: String,
      depth: Number,
      hasGeoData: Boolean
    },
    
    // Temporal information
    temporalData: {
      dateExtracted: Date,
      timeRange: {
        start: Date,
        end: Date
      },
      frequency: String,
      hasTemporalData: Boolean
    },
    
    // Research-specific metadata
    researchData: {
      species: [String],
      parameters: [String],
      methodology: String,
      equipment: String,
      quality: String
    },
    
    // Scientific patterns
    scientificPatterns: {
      found: Boolean,
      patterns: {
        coordinates: [String],
        temperatures: [String],
        species: [String],
        dates: [String],
        measurements: [String]
      }
    },
    
    // Table data extracted from images/documents
    tableData: {
      detected: Boolean,
      rows: Number,
      columns: Number,
      data: [[]],
      headers: [String]
    },
    
    // Structured data patterns
    structuredData: {
      found: Boolean,
      hasCSVPattern: Boolean,
      hasKeyValuePattern: Boolean,
      hasJSONPattern: Boolean
    },
    
    // Generic info for other file types
    genericInfo: {
      fileName: String,
      extension: String,
      size: Number,
      created: Date,
      modified: Date,
      error: String
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
dataFileSchema.index({ fileType: 1, uploadDate: -1 });
dataFileSchema.index({ category: 1, processingStatus: 1 });
dataFileSchema.index({ 'extractedMetadata.geoData.coordinates': '2dsphere' }, { sparse: true });
dataFileSchema.index({ originalName: 'text' });
dataFileSchema.index({ processingStatus: 1, validationStatus: 1 });

module.exports = mongoose.model('DataFile', dataFileSchema);
