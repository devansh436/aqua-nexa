const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const MetadataExtractor = require('./metadataExtractor');
const DataFile = require('../models/DataFile');
const FileMetadata = require('../models/FileMetadata');

class FileProcessor {
  
  async processFile(fileInfo, category = 'other') {
    try {
      console.log(`🚀 Starting file processing: ${fileInfo.originalname}`);
      
      // Determine file type and validate
      const fileType = this.determineFileType(fileInfo.mimetype, fileInfo.originalname);
      const validation = await this.validateFile(fileInfo, fileType);
      
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Create database record
      const dataFile = new DataFile({
        originalName: fileInfo.originalname,
        fileName: fileInfo.filename,
        mimeType: fileInfo.mimetype,
        size: fileInfo.size,
        fileType,
        category,
        filePath: fileInfo.path,
        processingStatus: 'processing',
        validationStatus: 'valid'
      });

      await dataFile.save();
      console.log(`📄 Database record created: ${dataFile._id}`);

      // Extract metadata asynchronously
      this.extractMetadataAsync(dataFile._id, fileInfo.path, fileType, fileInfo.mimetype);

      return {
        success: true,
        fileId: dataFile._id,
        message: 'File uploaded and processing started'
      };

    } catch (error) {
      console.error('❌ File processing failed:', error);
      throw error;
    }
  }

  async extractMetadataAsync(fileId, filePath, fileType, mimeType) {
    try {
      console.log(`🔍 Background metadata extraction for file: ${fileId}`);
      
      // Extract comprehensive metadata
      const extractedMetadata = await MetadataExtractor.extractMetadata(filePath, fileType, mimeType);
      
      // Update the DataFile record
      await DataFile.findByIdAndUpdate(fileId, {
        extractedMetadata,
        processingStatus: 'completed'
      });

      // Create detailed metadata record
      const fileMetadata = new FileMetadata({
        fileId,
        rawMetadata: extractedMetadata,
        structuredMetadata: {
          qualityMetrics: this.calculateQualityMetrics(extractedMetadata),
          processingHistory: [{
            operation: 'metadata_extraction',
            timestamp: new Date(),
            parameters: { fileType, mimeType },
            result: 'success'
          }]
        }
      });

      await fileMetadata.save();
      
      console.log(`✅ Metadata extraction completed for file: ${fileId}`);

    } catch (error) {
      console.error(`❌ Metadata extraction failed for file ${fileId}:`, error);
      
      // Update file record with error status
      await DataFile.findByIdAndUpdate(fileId, {
        processingStatus: 'failed',
        validationStatus: 'invalid',
        validationErrors: [{
          field: 'metadata_extraction',
          message: error.message
        }]
      });
    }
  }

  determineFileType(mimeType, fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    // Image files
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    
    // CSV files
    if (mimeType === 'text/csv' || extension === '.csv') {
      return 'csv';
    }
    
    // NetCDF files
    if (extension === '.nc' || mimeType === 'application/x-netcdf') {
      return 'netcdf';
    }
    
    // Table images (detected by filename patterns)
    if (mimeType.startsWith('image/') && 
        /table|chart|graph|data/i.test(fileName)) {
      return 'table';
    }
    
    return 'other';
  }

  async validateFile(fileInfo, fileType) {
    const errors = [];
    
    // File size validation
    const maxSizes = {
      image: 50 * 1024 * 1024, // 50MB
      csv: 100 * 1024 * 1024,  // 100MB
      netcdf: 500 * 1024 * 1024, // 500MB
      other: 100 * 1024 * 1024  // 100MB
    };
    
    const maxSize = maxSizes[fileType] || maxSizes.other;
    if (fileInfo.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // MIME type validation
    const allowedMimes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'],
      csv: ['text/csv', 'application/csv', 'text/plain'],
      netcdf: ['application/x-netcdf', 'application/octet-stream'],
      other: ['*']
    };

    const allowed = allowedMimes[fileType] || ['*'];
    if (!allowed.includes('*') && !allowed.includes(fileInfo.mimetype)) {
      errors.push(`Invalid file type. Expected: ${allowed.join(', ')}`);
    }

    // File existence check
    if (!await fs.pathExists(fileInfo.path)) {
      errors.push('File not found after upload');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  calculateQualityMetrics(metadata) {
    let completeness = 0;
    let accuracy = 0;
    let consistency = 0;
    let validity = 0;
    let timeliness = 100; // Default to 100 as it's newly uploaded

    // Completeness: based on how much metadata was extracted
    const metadataFields = ['imageInfo', 'extractedText', 'csvInfo', 'geoData', 'temporalData'];
    const presentFields = metadataFields.filter(field => 
      metadata[field] && Object.keys(metadata[field]).length > 0
    );
    completeness = (presentFields.length / metadataFields.length) * 100;

    // Accuracy: based on OCR confidence if available
    if (metadata.extractedText && metadata.extractedText.confidence) {
      accuracy = metadata.extractedText.confidence;
    } else {
      accuracy = 85; // Default for non-OCR files
    }

    // Consistency: basic check for data consistency
    consistency = 90; // Default high value

    // Validity: based on validation results
    validity = 95; // Default high value for validated files

    return {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      consistency: Math.round(consistency),
      validity: Math.round(validity),
      timeliness: Math.round(timeliness)
    };
  }

  async getFileById(fileId) {
    try {
      const file = await DataFile.findById(fileId).lean();
      const metadata = await FileMetadata.findOne({ fileId }).lean();
      
      return {
        ...file,
        detailedMetadata: metadata
      };
    } catch (error) {
      throw new Error(`File not found: ${error.message}`);
    }
  }

  async searchFiles(query = {}) {
    try {
      const {
        fileType,
        category,
        textSearch,
        dateRange,
        page = 1,
        limit = 20
      } = query;

      let filter = {};
      
      if (fileType) filter.fileType = fileType;
      if (category) filter.category = category;
      
      if (textSearch) {
        filter.$text = { $search: textSearch };
      }
      
      if (dateRange) {
        filter.uploadDate = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }

      const files = await DataFile.find(filter)
        .sort({ uploadDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await DataFile.countDocuments(filter);

      return {
        files,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}

module.exports = new FileProcessor();
