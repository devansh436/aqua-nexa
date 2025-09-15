const fs = require('fs');
const path = require('path');
const DataFile = require('../models/DataFile');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const ExcelJS = require('exceljs');
const mammoth = require('mammoth');
const xml2js = require('xml2js');
const JSZip = require('jszip');

// ✅ Complete File Type Determiner
const determineFileType = (mimeType, fileName) => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension)) {
    return 'image';
  }
  if (mimeType === 'text/csv' || extension === 'csv') {
    return 'csv';
  }
  if (['xlsx', 'xls'].includes(extension) || mimeType.includes('spreadsheetml')) {
    return 'excel';
  }
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }
  if (['doc', 'docx'].includes(extension) || mimeType.includes('document')) {
    return 'word';
  }
  if (mimeType === 'text/plain' || extension === 'txt') {
    return 'text';
  }
  if (mimeType === 'application/json' || extension === 'json') {
    return 'json';
  }
  if (mimeType.includes('xml') || extension === 'xml') {
    return 'xml';
  }
  if (mimeType === 'application/zip' || extension === 'zip') {
    return 'archive';
  }
  if (['nc', 'nc4'].includes(extension)) {
    return 'netcdf';
  }
  return 'other';
};

// ✅ FIXED OCR Service Class
class OCRService {
  constructor() {
    this.worker = null;
  }

  async initWorker() {
    if (!this.worker) {
      try {
        console.log('🔍 Initializing OCR worker...');
        
        // ✅ FIXED: Simple logger function to avoid cloning issues
        this.worker = await Tesseract.createWorker({
          logger: function(message) {
            if (message && message.status && typeof message.progress === 'number') {
              const progress = Math.round(message.progress * 100);
              console.log(`OCR ${message.status}: ${progress}%`);
            }
          }
        });
        
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
        console.log('✅ OCR worker ready');
      } catch (error) {
        console.error('❌ OCR initialization failed:', error);
        this.worker = null;
      }
    }
  }

  async extractText(imagePath) {
    try {
      await this.initWorker();
      if (!this.worker) {
        return { 
          text: '', 
          confidence: 0, 
          error: 'OCR worker failed to initialize',
          hasText: false,
          wordCount: 0,
          blocks: []
        };
      }

      console.log(`🔤 Extracting text from: ${imagePath}`);
      const { data } = await this.worker.recognize(imagePath);
      
      const extractedText = data.text || '';
      const confidence = data.confidence || 0;
      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
      
      return {
        text: extractedText,
        confidence: confidence,
        hasText: extractedText.trim().length > 0,
        wordCount: wordCount,
        language: 'eng',
        blocks: data.blocks?.map(block => ({
          text: block.text || '',
          bbox: block.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
          confidence: block.confidence || 0
        })) || []
      };
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        error: error.message,
        hasText: false,
        wordCount: 0,
        blocks: []
      };
    }
  }

  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        console.log('🔄 OCR worker terminated');
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
    }
  }
}

const ocrService = new OCRService();

// ✅ CSV Metadata Extraction
async function extractCSVMetadata(filePath) {
  try {
    console.log('📊 Processing CSV file:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { 
        csvInfo: { 
          error: 'Empty CSV file', 
          rows: 0, 
          columns: 0, 
          headers: [],
          hasHeaders: false,
          sampleData: []
        } 
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const dataLines = lines.slice(1);
    
    // Sample data with error handling
    const sampleData = [];
    for (let i = 0; i < Math.min(5, dataLines.length); i++) {
      try {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        sampleData.push(row);
      } catch (rowError) {
        console.warn(`Error processing row ${i}:`, rowError);
      }
    }

    // Column type analysis with error handling
    const columnTypes = {};
    headers.forEach(header => {
      try {
        const values = sampleData.map(row => row[header]).filter(v => v && v.trim());
        if (values.length === 0) {
          columnTypes[header] = 'empty';
        } else if (values.every(v => !isNaN(v) && !isNaN(parseFloat(v)) && v.trim() !== '')) {
          columnTypes[header] = 'numeric';
        } else if (values.every(v => !isNaN(Date.parse(v)))) {
          columnTypes[header] = 'date';
        } else {
          columnTypes[header] = 'text';
        }
      } catch (typeError) {
        columnTypes[header] = 'unknown';
      }
    });

    // Geographic data detection
    const geoData = extractGeoData(headers, dataLines);

    // Calculate quality metrics
    const qualityMetrics = {
      completeness: Math.round((sampleData.length / Math.min(5, dataLines.length)) * 100),
      accuracy: 95, // High for CSV parsing
      consistency: headers.length > 0 ? 90 : 50,
      validity: dataLines.length > 0 ? 92 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    const csvInfo = {
      rows: dataLines.length,
      columns: headers.length,
      headers: headers,
      delimiter: ',',
      hasHeaders: headers.length > 0,
      sampleData: sampleData,
      columnTypes: columnTypes,
      encoding: 'utf8',
      fileSize: content.length
    };

    const result = { 
      csvInfo,
      qualityMetrics 
    };
    
    if (geoData.hasGeoData) {
      result.geoData = geoData;
    }

    console.log(`✅ CSV processed: ${csvInfo.rows} rows, ${csvInfo.columns} columns`);
    return result;
  } catch (error) {
    console.error('❌ CSV processing failed:', error);
    return { 
      csvInfo: { 
        error: error.message,
        rows: 0,
        columns: 0,
        headers: [],
        hasHeaders: false,
        sampleData: []
      } 
    };
  }
}

// ✅ Excel Metadata Extraction
async function extractExcelMetadata(filePath) {
  try {
    console.log('📊 Processing Excel:', filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheets = [];
    let totalRows = 0;
    let totalCells = 0;
    
    workbook.eachSheet((worksheet, sheetId) => {
      const sheetInfo = {
        id: sheetId,
        name: worksheet.name || `Sheet${sheetId}`,
        rowCount: worksheet.rowCount || 0,
        columnCount: worksheet.columnCount || 0,
        hasData: (worksheet.rowCount || 0) > 0,
        headers: [],
        sampleData: []
      };
      
      totalRows += sheetInfo.rowCount;
      totalCells += (sheetInfo.rowCount * sheetInfo.columnCount);
      
      if (sheetInfo.hasData && sheetInfo.rowCount > 0) {
        try {
          const firstRow = worksheet.getRow(1);
          if (firstRow) {
            firstRow.eachCell((cell, colNumber) => {
              sheetInfo.headers.push(cell.text || cell.value?.toString() || `Column${colNumber}`);
            });
            
            // Sample data
            for (let i = 2; i <= Math.min(4, sheetInfo.rowCount); i++) {
              try {
                const row = worksheet.getRow(i);
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                  const header = sheetInfo.headers[colNumber - 1] || `Column${colNumber}`;
                  rowData[header] = cell.text || cell.value?.toString() || '';
                });
                sheetInfo.sampleData.push(rowData);
              } catch (rowError) {
                console.warn(`Error processing row ${i} in sheet ${sheetInfo.name}:`, rowError);
              }
            }
          }
        } catch (sheetError) {
          console.warn(`Error processing sheet ${sheetInfo.name}:`, sheetError);
          sheetInfo.error = sheetError.message;
        }
      }
      
      sheets.push(sheetInfo);
    });
    
    const qualityMetrics = {
      completeness: sheets.length > 0 ? 95 : 0,
      accuracy: 92,
      consistency: sheets.every(s => s.headers.length > 0) ? 90 : 70,
      validity: sheets.length > 0 ? 88 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    const result = {
      excelInfo: {
        totalSheets: sheets.length,
        sheets: sheets,
        format: path.extname(filePath).substring(1).toUpperCase(),
        hasData: sheets.some(sheet => sheet.hasData),
        totalRows: totalRows,
        totalCells: totalCells,
        fileSize: fs.statSync(filePath).size
      },
      qualityMetrics
    };

    console.log(`✅ Excel processed: ${sheets.length} sheets, ${totalRows} total rows`);
    return result;
  } catch (error) {
    console.error('❌ Excel processing failed:', error);
    return { 
      excelInfo: { 
        error: error.message,
        totalSheets: 0,
        sheets: [],
        hasData: false
      } 
    };
  }
}

// ✅ Image Metadata Extraction with OCR
async function extractImageMetadata(filePath) {
  try {
    console.log('🖼️ Processing image:', filePath);
    
    // Get image info with Sharp
    const imageInfo = await sharp(filePath).metadata();
    const stats = fs.statSync(filePath);
    
    const result = {
      imageInfo: {
        width: imageInfo.width || 0,
        height: imageInfo.height || 0,
        format: imageInfo.format || 'unknown',
        colorSpace: imageInfo.space || 'unknown',
        channels: imageInfo.channels || 0,
        hasAlpha: imageInfo.hasAlpha || false,
        density: imageInfo.density || 0,
        size: stats.size,
        quality: imageInfo.quality || 'unknown',
        orientation: imageInfo.orientation || 1
      }
    };

    // Extract text with OCR
    console.log('🔤 Starting OCR extraction...');
    const ocrResult = await ocrService.extractText(filePath);
    
    result.extractedText = {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      hasText: ocrResult.hasText,
      wordCount: ocrResult.wordCount,
      blocks: ocrResult.blocks,
      language: ocrResult.language || 'eng',
      lineCount: ocrResult.text ? ocrResult.text.split('\n').length : 0
    };

    // Detect table patterns in text
    if (ocrResult.hasText && containsTableData(ocrResult.text)) {
      result.tableData = extractTableFromText(ocrResult.text);
    }

    // Quality metrics
    const qualityMetrics = {
      completeness: imageInfo.width && imageInfo.height ? 95 : 50,
      accuracy: ocrResult.confidence || 0,
      consistency: imageInfo.format ? 90 : 70,
      validity: stats.size > 0 ? 85 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    result.qualityMetrics = qualityMetrics;

    console.log(`✅ Image processed: ${imageInfo.width}x${imageInfo.height}, OCR: ${ocrResult.confidence}%`);
    return result;
  } catch (error) {
    console.error('❌ Image processing failed:', error);
    return { 
      imageInfo: { 
        error: error.message,
        width: 0,
        height: 0,
        size: 0
      } 
    };
  }
}

// ✅ PDF Metadata Extraction
async function extractPDFMetadata(filePath) {
  try {
    console.log('📄 Processing PDF:', filePath);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const stats = fs.statSync(filePath);
    
    const extractedText = pdfData.text || '';
    const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
    
    const result = {
      pdfInfo: {
        pages: pdfData.numpages || 0,
        textLength: extractedText.length,
        hasText: extractedText.trim().length > 0,
        extractedText: extractedText.substring(0, 2000),
        wordCount: wordCount,
        lineCount: extractedText.split('\n').length,
        fileSize: stats.size,
        metadata: pdfData.metadata || {},
        info: pdfData.info || {},
        version: pdfData.version || 'unknown'
      }
    };

    // Extract scientific patterns
    const scientificData = extractScientificPatterns(extractedText);
    if (scientificData.found) {
      result.scientificPatterns = scientificData;
    }

    // Quality metrics
    const qualityMetrics = {
      completeness: extractedText.length > 0 ? 90 : 20,
      accuracy: extractedText.length > 100 ? 85 : 50,
      consistency: pdfData.numpages > 0 ? 88 : 0,
      validity: stats.size > 0 ? 92 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    result.qualityMetrics = qualityMetrics;

    console.log(`✅ PDF processed: ${pdfData.numpages} pages, ${wordCount} words`);
    return result;
  } catch (error) {
    console.error('❌ PDF processing failed:', error);
    return { 
      pdfInfo: { 
        error: error.message,
        pages: 0,
        hasText: false,
        wordCount: 0
      } 
    };
  }
}

// ✅ Word Document Metadata Extraction
async function extractWordMetadata(filePath) {
  try {
    console.log('📝 Processing Word document:', filePath);
    const result = await mammoth.extractRawText({ path: filePath });
    const stats = fs.statSync(filePath);
    
    const extractedText = result.value || '';
    const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
    
    const metadata = {
      wordInfo: {
        textLength: extractedText.length,
        hasText: extractedText.trim().length > 0,
        extractedText: extractedText.substring(0, 2000),
        wordCount: wordCount,
        lineCount: extractedText.split('\n').length,
        paragraphCount: extractedText.split('\n\n').length,
        format: path.extname(filePath).substring(1).toUpperCase(),
        fileSize: stats.size
      }
    };

    // Extract scientific patterns
    const scientificData = extractScientificPatterns(extractedText);
    if (scientificData.found) {
      metadata.scientificPatterns = scientificData;
    }

    // Quality metrics
    const qualityMetrics = {
      completeness: extractedText.length > 0 ? 88 : 20,
      accuracy: extractedText.length > 100 ? 82 : 50,
      consistency: wordCount > 0 ? 85 : 0,
      validity: stats.size > 0 ? 90 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    metadata.qualityMetrics = qualityMetrics;

    console.log(`✅ Word document processed: ${wordCount} words`);
    return metadata;
  } catch (error) {
    console.error('❌ Word processing failed:', error);
    return { 
      wordInfo: { 
        error: error.message,
        hasText: false,
        wordCount: 0
      } 
    };
  }
}

// ✅ Text File Metadata Extraction
async function extractTextMetadata(filePath) {
  try {
    console.log('📝 Processing text file:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    const result = {
      textInfo: {
        textLength: content.length,
        lineCount: content.split('\n').length,
        wordCount: wordCount,
        paragraphCount: content.split('\n\n').filter(p => p.trim()).length,
        hasContent: content.trim().length > 0,
        extractedText: content.substring(0, 2000),
        encoding: 'utf8',
        fileSize: stats.size
      }
    };

    // Look for structured data patterns
    const structuredData = detectStructuredText(content);
    if (structuredData.found) {
      result.structuredData = structuredData;
    }

    // Extract scientific patterns
    const scientificData = extractScientificPatterns(content);
    if (scientificData.found) {
      result.scientificPatterns = scientificData;
    }

    // Quality metrics
    const qualityMetrics = {
      completeness: content.length > 0 ? 95 : 0,
      accuracy: 98, // High for plain text
      consistency: wordCount > 0 ? 92 : 50,
      validity: stats.size > 0 ? 95 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    result.qualityMetrics = qualityMetrics;

    console.log(`✅ Text file processed: ${wordCount} words, ${result.textInfo.lineCount} lines`);
    return result;
  } catch (error) {
    console.error('❌ Text processing failed:', error);
    return { 
      textInfo: { 
        error: error.message,
        hasContent: false,
        wordCount: 0
      } 
    };
  }
}

// ✅ JSON Metadata Extraction
async function extractJSONMetadata(filePath) {
  try {
    console.log('🔧 Processing JSON:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const jsonData = JSON.parse(content);
    
    const result = {
      jsonInfo: {
        isValidJSON: true,
        size: content.length,
        fileSize: stats.size,
        hasArrays: containsArrays(jsonData),
        hasObjects: containsObjects(jsonData),
        depth: calculateJSONDepth(jsonData),
        keys: Object.keys(jsonData).slice(0, 20),
        structure: analyzeJSONStructure(jsonData),
        dataTypes: analyzeJSONDataTypes(jsonData)
      }
    };

    // Quality metrics
    const qualityMetrics = {
      completeness: Object.keys(jsonData).length > 0 ? 95 : 50,
      accuracy: 98, // High for valid JSON
      consistency: 90,
      validity: 95,
      overall: 94
    };

    result.qualityMetrics = qualityMetrics;

    console.log('✅ JSON processed successfully');
    return result;
  } catch (error) {
    console.error('❌ JSON processing failed:', error);
    return { 
      jsonInfo: { 
        isValidJSON: false, 
        error: error.message,
        size: 0
      } 
    };
  }
}

// ✅ XML Metadata Extraction
async function extractXMLMetadata(filePath) {
  try {
    console.log('📋 Processing XML:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(content);
    
    const metadata = {
      xmlInfo: {
        isValidXML: true,
        size: content.length,
        fileSize: stats.size,
        rootElement: Object.keys(result)[0] || 'unknown',
        elementCount: countXMLElements(result),
        hasAttributes: containsXMLAttributes(result),
        namespaces: extractXMLNamespaces(content),
        encoding: extractXMLEncoding(content) || 'UTF-8'
      }
    };

    // Quality metrics
    const qualityMetrics = {
      completeness: Object.keys(result).length > 0 ? 90 : 30,
      accuracy: 95,
      consistency: 88,
      validity: 92,
      overall: 91
    };

    metadata.qualityMetrics = qualityMetrics;

    console.log('✅ XML processed successfully');
    return metadata;
  } catch (error) {
    console.error('❌ XML processing failed:', error);
    return { 
      xmlInfo: { 
        isValidXML: false, 
        error: error.message,
        size: 0
      } 
    };
  }
}

// ✅ Archive Metadata Extraction
async function extractArchiveMetadata(filePath) {
  try {
    console.log('🗃️ Processing archive:', filePath);
    const data = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(data);
    
    const files = [];
    const fileTypes = {};
    let totalUncompressed = 0;
    let totalCompressed = 0;
    
    zipContent.forEach((relativePath, file) => {
      const fileInfo = {
        name: relativePath,
        size: file._data ? file._data.uncompressedSize : 0,
        compressed: file._data ? file._data.compressedSize : 0,
        isDirectory: file.dir,
        extension: path.extname(relativePath).toLowerCase()
      };
      
      if (!file.dir) {
        totalUncompressed += fileInfo.size;
        totalCompressed += fileInfo.compressed;
        
        // Count file types
        const ext = fileInfo.extension || 'no-extension';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
      
      files.push(fileInfo);
    });
    
    const result = {
      archiveInfo: {
        totalFiles: files.filter(f => !f.isDirectory).length,
        directories: files.filter(f => f.isDirectory).length,
        totalItems: files.length,
        files: files.filter(f => !f.isDirectory).slice(0, 20), // First 20 files
        directories_list: files.filter(f => f.isDirectory).slice(0, 10), // First 10 dirs
        totalUncompressedSize: totalUncompressed,
        totalCompressedSize: totalCompressed,
        fileSize: stats.size,
        compressionRatio: totalUncompressed > 0 ? Math.round((totalCompressed / totalUncompressed) * 100) : 0,
        fileTypes: fileTypes,
        format: path.extname(filePath).substring(1).toUpperCase()
      }
    };

    // Quality metrics
    const qualityMetrics = {
      completeness: files.length > 0 ? 90 : 20,
      accuracy: 95,
      consistency: 88,
      validity: files.length > 0 ? 92 : 0,
      overall: 0
    };
    qualityMetrics.overall = Math.round(
      (qualityMetrics.completeness + qualityMetrics.accuracy + 
       qualityMetrics.consistency + qualityMetrics.validity) / 4
    );

    result.qualityMetrics = qualityMetrics;

    console.log(`✅ Archive processed: ${result.archiveInfo.totalFiles} files, ${result.archiveInfo.directories} directories`);
    return result;
  } catch (error) {
    console.error('❌ Archive processing failed:', error);
    return { 
      archiveInfo: { 
        error: error.message,
        totalFiles: 0,
        directories: 0
      } 
    };
  }
}

// ✅ Helper Functions
function extractGeoData(headers, dataLines) {
  try {
    const geoHeaders = headers.filter(h => /lat|lon|longitude|latitude|coord/i.test(h));
    
    if (geoHeaders.length >= 2 && dataLines.length > 0) {
      const latHeader = geoHeaders.find(h => /lat/i.test(h));
      const lonHeader = geoHeaders.find(h => /lon/i.test(h));
      
      if (latHeader && lonHeader) {
        const values = dataLines[0].split(',');
        const latIdx = headers.indexOf(latHeader);
        const lonIdx = headers.indexOf(lonHeader);
        
        if (latIdx >= 0 && lonIdx >= 0 && values[latIdx] && values[lonIdx]) {
          const lat = parseFloat(values[latIdx].trim().replace(/['"]/g, ''));
          const lon = parseFloat(values[lonIdx].trim().replace(/['"]/g, ''));
          
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            return {
              coordinates: {
                type: 'Point',
                coordinates: [lon, lat]
              },
              hasGeoData: true,
              location: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
              coordinateSystem: 'WGS84'
            };
          }
        }
      }
    }
    
    return { hasGeoData: false };
  } catch (error) {
    console.warn('Error extracting geo data:', error);
    return { hasGeoData: false };
  }
}

function containsTableData(text) {
  if (!text || text.trim().length === 0) return false;
  
  const lines = text.split('\n').filter(line => line.trim());
  return lines.length > 3 && 
         lines.some(line => 
           (line.match(/\s{2,}/g) || []).length > 1 ||
           (line.match(/\t/g) || []).length > 0 ||
           (line.match(/,/g) || []).length > 1
         );
}

function extractTableFromText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const tableRows = lines.map(line => 
    line.split(/\s{2,}|\t|,/).map(cell => cell.trim()).filter(cell => cell)
  ).filter(row => row.length > 1);
  
  return {
    detected: tableRows.length > 2,
    rows: tableRows.length,
    columns: tableRows.length > 0 ? Math.max(...tableRows.map(row => row.length)) : 0,
    data: tableRows.slice(0, 10),
    headers: tableRows[0] || []
  };
}

function extractScientificPatterns(text) {
  if (!text || typeof text !== 'string') {
    return { found: false, patterns: {} };
  }

  const patterns = {
    coordinates: text.match(/\d+\.?\d*[°]?\s*[NS]\s*,?\s*\d+\.?\d*[°]?\s*[EW]/gi) || [],
    temperatures: text.match(/\d+\.?\d*\s*[°]?[CF]\b/gi) || [],
    species: text.match(/\b[A-Z][a-z]+\s+[a-z]+\b/g) || [],
    dates: text.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/g) || [],
    measurements: text.match(/\d+\.?\d*\s*(m|cm|mm|km|kg|g|l|ml|ppm|mg\/l)\b/gi) || [],
    chemicals: text.match(/\b(NaCl|CaCO3|pH|O2|CO2|H2O|NH3|NO3|PO4)\b/gi) || [],
    coordinates_decimal: text.match(/\d{1,2}\.\d{4,6}[°]?\s*[NS]?\s*,?\s*\d{1,3}\.\d{4,6}[°]?\s*[EW]?/gi) || []
  };
  
  // Remove duplicates and limit results
  Object.keys(patterns).forEach(key => {
    patterns[key] = [...new Set(patterns[key])].slice(0, 10);
  });
  
  const found = Object.values(patterns).some(arr => arr.length > 0);
  
  return {
    found,
    patterns: Object.fromEntries(
      Object.entries(patterns).filter(([key, value]) => value.length > 0)
    ),
    confidence: found ? 85 : 0
  };
}

function detectStructuredText(content) {
  if (!content || typeof content !== 'string') {
    return { found: false };
  }

  const csvPattern = /^[^,\n]*,[^,\n]*,/m;
  const keyValuePattern = /^\w+\s*[:=]\s*.+$/m;
  const jsonPattern = /^\s*[{\[]/;
  const xmlPattern = /^\s*<[\w\s="'\/]+>/m;
  
  return {
    found: csvPattern.test(content) || keyValuePattern.test(content) || 
           jsonPattern.test(content) || xmlPattern.test(content),
    hasCSVPattern: csvPattern.test(content),
    hasKeyValuePattern: keyValuePattern.test(content),
    hasJSONPattern: jsonPattern.test(content),
    hasXMLPattern: xmlPattern.test(content)
  };
}

function containsArrays(obj) {
  if (Array.isArray(obj)) return true;
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(containsArrays);
  }
  return false;
}

function containsObjects(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function calculateJSONDepth(obj, depth = 0) {
  if (depth > 10) return depth; // Prevent infinite recursion
  if (typeof obj !== 'object' || obj === null) return depth;
  
  if (Array.isArray(obj)) {
    return obj.length > 0 ? 
      Math.max(...obj.map(item => calculateJSONDepth(item, depth + 1))) : 
      depth + 1;
  }
  
  const depths = Object.values(obj).map(value => calculateJSONDepth(value, depth + 1));
  return depths.length > 0 ? Math.max(...depths) : depth + 1;
}

function analyzeJSONStructure(obj) {
  if (Array.isArray(obj)) {
    return `Array with ${obj.length} items`;
  } else if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    return `Object with ${keys.length} properties`;
  } else {
    return typeof obj;
  }
}

function analyzeJSONDataTypes(obj) {
  const types = {};
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        types[key] = `array[${value.length}]`;
      } else if (typeof value === 'object' && value !== null) {
        types[key] = 'object';
      } else {
        types[key] = typeof value;
      }
    });
  }
  
  return types;
}

function containsXMLAttributes(obj) {
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).some(key => key.startsWith('$')) ||
           Object.values(obj).some(value => containsXMLAttributes(value));
  }
  return false;
}

function countXMLElements(obj, count = 0) {
  if (typeof obj !== 'object' || obj === null) return count;
  
  Object.values(obj).forEach(value => {
    if (Array.isArray(value)) {
      count += value.length;
      value.forEach(item => {
        count = countXMLElements(item, count);
      });
    } else if (typeof value === 'object') {
      count += 1;
      count = countXMLElements(value, count);
    } else {
      count += 1;
    }
  });
  
  return count;
}

function extractXMLNamespaces(content) {
  const namespacePattern = /xmlns:?(\w*)\s*=\s*["']([^"']+)["']/g;
  const namespaces = [];
  let match;
  
  while ((match = namespacePattern.exec(content)) !== null) {
    namespaces.push({
      prefix: match[1] || 'default',
      uri: match[2]
    });
  }
  
  return namespaces;
}

function extractXMLEncoding(content) {
  const encodingMatch = content.match(/encoding\s*=\s*["']([^"']+)["']/i);
  return encodingMatch ? encodingMatch[1] : null;
}

// ✅ MAIN METADATA EXTRACTION FUNCTION
async function extractMetadataForFile(fileId, filePath, fileType, mimeType) {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Starting metadata extraction for: ${fileId} (${fileType})`);
    
    let extractedMetadata = {
      extractedAt: new Date(),
      fileType,
      mimeType,
      processingStartTime: new Date(startTime)
    };

    // Extract metadata based on file type
    switch (fileType) {
      case 'csv':
        Object.assign(extractedMetadata, await extractCSVMetadata(filePath));
        break;
      case 'excel':
        Object.assign(extractedMetadata, await extractExcelMetadata(filePath));
        break;
      case 'image':
        Object.assign(extractedMetadata, await extractImageMetadata(filePath));
        break;
      case 'pdf':
        Object.assign(extractedMetadata, await extractPDFMetadata(filePath));
        break;
      case 'word':
        Object.assign(extractedMetadata, await extractWordMetadata(filePath));
        break;
      case 'text':
        Object.assign(extractedMetadata, await extractTextMetadata(filePath));
        break;
      case 'json':
        Object.assign(extractedMetadata, await extractJSONMetadata(filePath));
        break;
      case 'xml':
        Object.assign(extractedMetadata, await extractXMLMetadata(filePath));
        break;
      case 'archive':
        Object.assign(extractedMetadata, await extractArchiveMetadata(filePath));
        break;
      case 'netcdf':
        const stats = fs.statSync(filePath);
        extractedMetadata.netcdfInfo = {
          fileSize: stats.size,
          format: 'NetCDF',
          note: 'Basic NetCDF info - install netcdf4 for full parsing',
          created: stats.birthtime,
          modified: stats.mtime
        };
        extractedMetadata.qualityMetrics = {
          completeness: 30,
          accuracy: 95,
          consistency: 80,
          validity: 85,
          overall: 73
        };
        break;
      default:
        const genericStats = fs.statSync(filePath);
        extractedMetadata.genericInfo = {
          fileName: path.basename(filePath),
          extension: path.extname(filePath),
          size: genericStats.size,
          created: genericStats.birthtime,
          modified: genericStats.mtime,
          isReadable: true
        };
        extractedMetadata.qualityMetrics = {
          completeness: 50,
          accuracy: 90,
          consistency: 70,
          validity: 80,
          overall: 73
        };
    }

    // Add processing statistics
    const endTime = Date.now();
    extractedMetadata.processingStats = {
      processingDuration: endTime - startTime,
      processingEndTime: new Date(endTime),
      memoryUsed: process.memoryUsage().heapUsed,
      success: true
    };

    // Ensure quality metrics exist
    if (!extractedMetadata.qualityMetrics) {
      extractedMetadata.qualityMetrics = {
        completeness: 80,
        accuracy: 85,
        consistency: 82,
        validity: 88,
        overall: 84
      };
    }

    // Update database with extracted metadata
    const updatedFile = await DataFile.findByIdAndUpdate(fileId, {
      $set: {
        extractedMetadata: extractedMetadata,
        processingStatus: 'completed'
      }
    }, { new: true });

    console.log(`✅ Metadata extraction completed for: ${fileId} in ${endTime - startTime}ms`);
    return updatedFile;

  } catch (error) {
    const endTime = Date.now();
    console.error(`❌ Metadata extraction failed for ${fileId}:`, error);
    
    // Add error stats
    const errorMetadata = {
      extractedAt: new Date(),
      fileType,
      mimeType,
      processingStats: {
        processingDuration: endTime - startTime,
        processingEndTime: new Date(endTime),
        success: false,
        error: error.message
      },
      qualityMetrics: {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        overall: 0
      },
      error: error.message
    };

    await DataFile.findByIdAndUpdate(fileId, {
      $set: {
        extractedMetadata: errorMetadata,
        processingStatus: 'failed',
        validationErrors: [{ 
          field: 'processing', 
          message: error.message,
          code: 'EXTRACTION_FAILED',
          timestamp: new Date()
        }]
      }
    });
    
    throw error;
  }
}

// ✅ MAIN UPLOAD CONTROLLER CLASS
class UploadController {
  
  async uploadFile(req, res) {
    try {
      console.log('🚀 Upload controller started');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { category = 'other', description = '', tags = '' } = req.body;
      
      console.log(`📁 File received: ${req.file.originalname} (${req.file.size} bytes)`);
      
      // Create uploads directory structure
      const uploadsDir = './uploads';
      const today = new Date().toISOString().split('T')[0];
      const dateDir = path.join(uploadsDir, today);
      
      [uploadsDir, dateDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`📁 Created directory: ${dir}`);
        }
      });
      
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1000);
      const ext = path.extname(req.file.originalname);
      const filename = `file-${timestamp}-${random}${ext}`;
      const filepath = path.join(dateDir, filename);
      
      // Save file to disk
      fs.writeFileSync(filepath, req.file.buffer);
      console.log('💾 File saved to:', filepath);

      // Determine file type
      const fileType = determineFileType(req.file.mimetype, req.file.originalname);
      console.log('🔍 Detected file type:', fileType);

      // Create database record
      const dataFile = new DataFile({
        originalName: req.file.originalname,
        fileName: filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        fileType: fileType,
        category,
        filePath: filepath,
        processingStatus: 'processing',
        validationStatus: 'valid',
        uploadDate: new Date()
      });

      const savedFile = await dataFile.save();
      console.log('📄 Database record created:', savedFile._id);

      // Start metadata extraction in background
      setImmediate(() => {
        extractMetadataForFile(savedFile._id, filepath, fileType, req.file.mimetype)
          .catch(error => {
            console.error('Background processing failed:', error);
          });
      });

      res.status(201).json({
        success: true,
        fileId: savedFile._id,
        message: 'File uploaded and processing started',
        fileInfo: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          detectedType: fileType,
          uploadDate: savedFile.uploadDate
        }
      });

    } catch (error) {
      console.error('❌ Upload failed:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed: ' + error.message
      });
    }
  }

  async getFileStatus(req, res) {
    try {
      const { fileId } = req.params;
      const file = await DataFile.findById(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        file: {
          id: file._id,
          originalName: file.originalName,
          fileType: file.fileType,
          size: file.size,
          uploadDate: file.uploadDate,
          processingStatus: file.processingStatus,
          validationStatus: file.validationStatus,
          extractedMetadata: file.extractedMetadata || {},
          validationErrors: file.validationErrors || []
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching file status: ' + error.message
      });
    }
  }

  async searchFiles(req, res) {
    try {
      const { 
        fileType, 
        category, 
        status, 
        limit = 50, 
        page = 1,
        sortBy = 'uploadDate',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      let query = {};
      if (fileType) query.fileType = fileType;
      if (category) query.category = category;
      if (status) query.processingStatus = status;

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const files = await DataFile.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('originalName fileType category size uploadDate processingStatus extractedMetadata.qualityMetrics');

      const total = await DataFile.countDocuments(query);

      res.json({
        success: true,
        files: files.map(file => ({
          id: file._id,
          originalName: file.originalName,
          fileType: file.fileType,
          category: file.category,
          size: file.size,
          uploadDate: file.uploadDate,
          processingStatus: file.processingStatus,
          qualityScore: file.extractedMetadata?.qualityMetrics?.overall || 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Search failed: ' + error.message
      });
    }
  }

  async getFileMetadata(req, res) {
    try {
      const { fileId } = req.params;
      const file = await DataFile.findById(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        fileInfo: {
          id: file._id,
          originalName: file.originalName,
          fileType: file.fileType,
          size: file.size,
          uploadDate: file.uploadDate,
          processingStatus: file.processingStatus
        },
        metadata: file.extractedMetadata || {}
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching metadata: ' + error.message
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const file = await DataFile.findById(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete physical file
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
        console.log(`🗑️ Deleted physical file: ${file.filePath}`);
      }

      // Delete database record
      await DataFile.findByIdAndDelete(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting file: ' + error.message
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await DataFile.aggregate([
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgQuality: { $avg: '$extractedMetadata.qualityMetrics.overall' },
            byFileType: {
              $push: {
                fileType: '$fileType',
                count: 1,
                size: '$size'
              }
            },
            byStatus: {
              $push: {
                status: '$processingStatus',
                count: 1
              }
            }
          }
        }
      ]);

      const fileTypeStats = await DataFile.aggregate([
        {
          $group: {
            _id: '$fileType',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgQuality: { $avg: '$extractedMetadata.qualityMetrics.overall' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const statusStats = await DataFile.aggregate([
        {
          $group: {
            _id: '$processingStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        statistics: {
          overview: stats[0] || {
            totalFiles: 0,
            totalSize: 0,
            avgQuality: 0
          },
          fileTypes: fileTypeStats,
          processingStatus: statusStats
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics: ' + error.message
      });
    }
  }
}

// Cleanup on exit
process.on('exit', () => {
  ocrService.terminate();
});

process.on('SIGINT', () => {
  ocrService.terminate();
  process.exit();
});

process.on('SIGTERM', () => {
  ocrService.terminate();
  process.exit();
});

module.exports = new UploadController();
