const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parse');
const Papa = require('papaparse');
const OCRService = require('./ocrService');

class MetadataExtractor {
  
  async extractMetadata(filePath, fileType, mimeType) {
    console.log(`🔍 Extracting metadata for: ${path.basename(filePath)} (${fileType})`);
    
    try {
      let metadata = {
        extractedAt: new Date(),
        fileType,
        mimeType
      };

      // Route to appropriate extraction method
      switch (fileType) {
        case 'image':
          metadata = await this.extractImageMetadata(filePath, metadata);
          break;
        case 'csv':
          metadata = await this.extractCSVMetadata(filePath, metadata);
          break;
        case 'netcdf':
          metadata = await this.extractNetCDFMetadata(filePath, metadata);
          break;
        case 'table':
          metadata = await this.extractTableMetadata(filePath, metadata);
          break;
        default:
          metadata = await this.extractGenericMetadata(filePath, metadata);
      }

      console.log(`✅ Metadata extraction completed for ${fileType}`);
      return metadata;

    } catch (error) {
      console.error(`❌ Metadata extraction failed:`, error);
      throw new Error(`Metadata extraction failed: ${error.message}`);
    }
  }

  async extractImageMetadata(filePath, baseMetadata) {
    try {
      // Extract basic image information using Sharp
      const imageInfo = await sharp(filePath).metadata();
      
      console.log(`📸 Image info: ${imageInfo.width}x${imageInfo.height}, ${imageInfo.format}`);
      
      baseMetadata.imageInfo = {
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
        hasAlpha: imageInfo.hasAlpha,
        density: imageInfo.density,
        colorSpace: imageInfo.space,
        channels: imageInfo.channels,
        size: imageInfo.size
      };

      // Extract EXIF data if available
      if (imageInfo.exif) {
        baseMetadata.exifData = this.parseExifData(imageInfo.exif);
      }

      // Perform OCR to extract text
      try {
        console.log('🔤 Performing OCR text extraction...');
        const ocrResult = await OCRService.extractTextFromImage(filePath);
        
        baseMetadata.extractedText = {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          language: 'eng',
          blocks: ocrResult.blocks,
          wordCount: ocrResult.text.split(/\s+/).length,
          hasText: ocrResult.text.trim().length > 0
        };

        // Attempt table extraction if text is structured
        if (this.looksLikeTable(ocrResult.text)) {
          const tableResult = await OCRService.extractTableFromImage(filePath);
          baseMetadata.tableData = tableResult.tableData;
        }

      } catch (ocrError) {
        console.warn('⚠️ OCR extraction failed, continuing without text extraction:', ocrError.message);
        baseMetadata.extractedText = {
          text: '',
          confidence: 0,
          error: ocrError.message
        };
      }

      return baseMetadata;

    } catch (error) {
      console.error('❌ Image metadata extraction failed:', error);
      throw error;
    }
  }

  async extractCSVMetadata(filePath, baseMetadata) {
    return new Promise((resolve, reject) => {
      const results = [];
      let headers = [];
      let rowCount = 0;
      let delimiter = ',';

      // First, try to detect delimiter
      const sampleData = fs.readFileSync(filePath, 'utf8').substring(0, 1024);
      const detectedDelimiter = Papa.parse(sampleData).meta.delimiter;
      if (detectedDelimiter) {
        delimiter = detectedDelimiter;
      }

      console.log(`📊 Processing CSV with delimiter: '${delimiter}'`);

      const parser = csv({
        delimiter: delimiter,
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
      });

      parser.on('headers', (headerList) => {
        headers = headerList;
        console.log(`📋 CSV Headers: ${headers.join(', ')}`);
      });

      parser.on('readable', function() {
        let record;
        while (record = parser.read()) {
          if (rowCount < 5) { // Keep first 5 rows as sample
            results.push(record);
          }
          rowCount++;
        }
      });

      parser.on('error', (err) => {
        console.error('❌ CSV parsing error:', err);
        reject(err);
      });

      parser.on('end', () => {
        baseMetadata.csvInfo = {
          rows: rowCount,
          columns: headers.length,
          headers: headers,
          delimiter: delimiter,
          hasHeaders: headers.length > 0,
          sampleData: results,
          encoding: 'utf-8'
        };

        // Analyze data types
        baseMetadata.csvInfo.columnTypes = this.analyzeColumnTypes(results, headers);
        
        // Look for geographic data
        baseMetadata.geoData = this.extractGeoDataFromCSV(results, headers);
        
        // Look for temporal data
        baseMetadata.temporalData = this.extractTemporalDataFromCSV(results, headers);

        console.log(`✅ CSV processed: ${rowCount} rows, ${headers.length} columns`);
        resolve(baseMetadata);
      });

      fs.createReadStream(filePath).pipe(parser);
    });
  }

  async extractNetCDFMetadata(filePath, baseMetadata) {
    try {
      // Note: This is a placeholder - you'd need to install netcdf4 or similar
      // For now, we'll extract basic file information
      console.log('🌐 Processing NetCDF file (basic extraction)');
      
      const stats = await fs.stat(filePath);
      
      baseMetadata.netcdfInfo = {
        fileSize: stats.size,
        variables: [], // Would be populated with actual NetCDF parsing
        dimensions: {},
        globalAttributes: {},
        note: 'NetCDF parsing requires additional libraries'
      };

      return baseMetadata;
    } catch (error) {
      console.error('❌ NetCDF metadata extraction failed:', error);
      throw error;
    }
  }

  async extractTableMetadata(filePath, baseMetadata) {
    // For table images, use OCR with table detection
    return await this.extractImageMetadata(filePath, baseMetadata);
  }

  async extractGenericMetadata(filePath, baseMetadata) {
    try {
      const stats = await fs.stat(filePath);
      const fileInfo = path.parse(filePath);
      
      baseMetadata.genericInfo = {
        fileName: fileInfo.name,
        extension: fileInfo.ext,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };

      return baseMetadata;
    } catch (error) {
      console.error('❌ Generic metadata extraction failed:', error);
      throw error;
    }
  }

  // Helper methods
  parseExifData(exifBuffer) {
    // Basic EXIF parsing - in production, you'd use a proper EXIF library
    try {
      return {
        hasExif: true,
        size: exifBuffer.length
      };
    } catch (error) {
      return { hasExif: false };
    }
  }

  looksLikeTable(text) {
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Simple heuristic: if multiple lines have similar patterns, might be a table
    return nonEmptyLines.length > 3 && 
           nonEmptyLines.some(line => 
             (line.match(/\s{2,}/g) || []).length > 1 ||
             (line.match(/\t/g) || []).length > 0 ||
             (line.match(/,/g) || []).length > 1
           );
  }

  analyzeColumnTypes(sampleData, headers) {
    const types = {};
    
    headers.forEach(header => {
      const values = sampleData.map(row => row[header]).filter(val => val && val.trim());
      
      if (values.length === 0) {
        types[header] = 'empty';
        return;
      }

      const numericValues = values.filter(val => !isNaN(val) && !isNaN(parseFloat(val)));
      const dateValues = values.filter(val => !isNaN(Date.parse(val)));

      if (numericValues.length === values.length) {
        types[header] = 'numeric';
      } else if (dateValues.length === values.length) {
        types[header] = 'date';
      } else {
        types[header] = 'text';
      }
    });

    return types;
  }

  extractGeoDataFromCSV(sampleData, headers) {
    // Look for geographic columns
    const geoHeaders = headers.filter(h => 
      /lat|lon|longitude|latitude|coord/i.test(h)
    );

    if (geoHeaders.length >= 2) {
      const latHeader = geoHeaders.find(h => /lat/i.test(h));
      const lonHeader = geoHeaders.find(h => /lon/i.test(h));

      if (latHeader && lonHeader && sampleData.length > 0) {
        const lat = parseFloat(sampleData[latHeader]);
        const lon = parseFloat(sampleData[lonHeader]);

        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            coordinates: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            hasGeoData: true
          };
        }
      }
    }

    return { hasGeoData: false };
  }

  extractTemporalDataFromCSV(sampleData, headers) {
    // Look for date/time columns
    const timeHeaders = headers.filter(h => 
      /date|time|timestamp|created|updated/i.test(h)
    );

    if (timeHeaders.length > 0 && sampleData.length > 0) {
      const timeHeader = timeHeaders;
      const dateValue = sampleData[timeHeader];

      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return {
          dateExtracted: parsedDate,
          hasTemporalData: true,
          timeColumn: timeHeader
        };
      }
    }

    return { hasTemporalData: false };
  }
}

module.exports = new MetadataExtractor();
