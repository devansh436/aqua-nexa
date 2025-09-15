const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs-extra');

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker({
        logger: m => console.log(`OCR: ${m.status} - ${m.progress}%`)
      });
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  async extractTextFromImage(imagePath) {
    try {
      console.log(`🔍 Starting OCR extraction for: ${imagePath}`);
      
      // Initialize worker if not already done
      await this.initializeWorker();
      
      // Preprocess image for better OCR results
      const preprocessedPath = await this.preprocessImage(imagePath);
      
      // Perform OCR
      const { data } = await this.worker.recognize(preprocessedPath);
      
      // Clean up preprocessed image
      if (preprocessedPath !== imagePath) {
        await fs.remove(preprocessedPath);
      }
      
      console.log(`✅ OCR completed with ${data.confidence}% confidence`);
      
      return {
        text: data.text,
        confidence: data.confidence,
        blocks: data.blocks.map(block => ({
          text: block.text,
          bbox: block.bbox,
          confidence: block.confidence
        })),
        words: data.words?.map(word => ({
          text: word.text,
          bbox: word.bbox,
          confidence: word.confidence
        })) || []
      };
      
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  async preprocessImage(imagePath) {
    try {
      const outputPath = imagePath.replace(/\.[^.]+$/, '_processed.jpg');
      
      // Get image metadata first
      const metadata = await sharp(imagePath).metadata();
      console.log(`📸 Preprocessing image: ${metadata.width}x${metadata.height}, ${metadata.format}`);
      
      // Apply preprocessing for better OCR
      await sharp(imagePath)
        .greyscale() // Convert to grayscale
        .normalize() // Enhance contrast
        .sharpen() // Sharpen the image
        .resize({ 
          width: Math.max(1200, metadata.width), 
          withoutEnlargement: true 
        }) // Ensure minimum width for better OCR
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✨ Image preprocessed: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  async extractTableFromImage(imagePath) {
    try {
      console.log(`📊 Extracting table structure from: ${imagePath}`);
      
      const ocrResult = await this.extractTextFromImage(imagePath);
      
      // Simple table detection logic
      const lines = ocrResult.text.split('\n').filter(line => line.trim().length > 0);
      const potentialTable = this.detectTableStructure(lines);
      
      return {
        ...ocrResult,
        tableData: potentialTable
      };
      
    } catch (error) {
      console.error('❌ Table extraction failed:', error);
      throw error;
    }
  }

  detectTableStructure(lines) {
    // Basic table detection logic
    const tableRows = [];
    
    for (const line of lines) {
      // Look for patterns that suggest tabular data
      const cells = line.split(/\s{2,}|\t|,/).filter(cell => cell.trim().length > 0);
      
      if (cells.length > 1) {
        tableRows.push(cells);
      }
    }
    
    return {
      detected: tableRows.length > 2,
      rows: tableRows.length,
      columns: tableRows.length > 0 ? Math.max(...tableRows.map(row => row.length)) : 0,
      data: tableRows.slice(0, 10), // First 10 rows as sample
      headers: tableRows.length > 0 ? tableRows : []
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      console.log('🔄 OCR worker terminated');
    }
  }
}

module.exports = new OCRService();
