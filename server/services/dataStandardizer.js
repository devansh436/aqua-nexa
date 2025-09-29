const sharp = require('sharp');

class DataStandardizer {
  constructor() {
    this.dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/,     // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,   // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,     // MM-DD-YYYY
    ];
    
    this.timeFormats = [
      /^\d{2}:\d{2}$/,           // HH:MM
      /^\d{2}:\d{2}:\d{2}$/,     // HH:MM:SS
    ];
  }

  async standardizeData(fileData, fileType, category) {
    console.log(`🔄 Standardizing ${category} data`);
    
    try {
      switch (fileType) {
        case 'csv':
        case 'excel':
          return await this.standardizeTabularData(fileData, category);
        case 'image':
          return await this.standardizeImageData(fileData, category);
        case 'json':
          return await this.standardizeJSONData(fileData, category);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('❌ Standardization failed:', error);
      throw error;
    }
  }

  async standardizeTabularData(data, category) {
    const records = [];
    const headers = data.headers || [];
    const rows = data.data || [];

    // Find location, date, time columns
    const locationCol = this.findColumn(headers, ['location', 'site', 'station', 'place']);
    const dateCol = this.findColumn(headers, ['date', 'sampling_date', 'collection_date']);
    const timeCol = this.findColumn(headers, ['time', 'sampling_time', 'collection_time']);

    if (!locationCol || !dateCol || !timeCol) {
      console.warn('⚠️ Missing required columns (location, date, time)');
    }

    for (const row of rows) {
      try {
        const location = row[locationCol] || 'Unknown';
        const date = this.standardizeDate(row[dateCol]);
        const time = this.standardizeTime(row[timeCol]);

        if (!date || !time) {
          console.warn('⚠️ Skipping row with invalid date/time');
          continue;
        }

        // Extract category-specific data
        const standardizedData = this.extractCategoryData(row, headers, category);

        records.push({
          location: location,
          date: date,
          time: time,
          data: standardizedData
        });
      } catch (error) {
        console.warn('⚠️ Error processing row:', error.message);
      }
    }

    return {
      records: records,
      total_records: records.length,
      schema_info: headers,
      processing_notes: [`Standardized ${records.length} records from ${rows.length} input rows`]
    };
  }

  async standardizeImageData(imageData, category) {
    if (category !== 'otolith_image') {
      throw new Error('Image standardization only supported for otolith images');
    }

    const features = await this.extractOtolithFeatures(imageData);
    
    return {
      records: [{
        location: 'Unknown', // Will need to be updated manually or from filename
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        data: {
          image_file: imageData.filename,
          circularity: features.circularity,
          area: features.area,
          perimeter: features.perimeter,
          aspect_ratio: features.aspect_ratio,
          volume: features.volume
        }
      }],
      total_records: 1,
      schema_info: ['image_file', 'circularity', 'area', 'perimeter', 'aspect_ratio', 'volume'],
      processing_notes: ['Extracted morphometric features from otolith image']
    };
  }

  async standardizeJSONData(jsonData, category) {
    const records = [];
    
    // Handle different JSON structures
    if (Array.isArray(jsonData.data)) {
      for (const item of jsonData.data) {
        const standardized = this.processJSONItem(item, category);
        if (standardized) records.push(standardized);
      }
    } else if (typeof jsonData.data === 'object') {
      const standardized = this.processJSONItem(jsonData.data, category);
      if (standardized) records.push(standardized);
    }

    return {
      records: records,
      total_records: records.length,
      schema_info: Object.keys(records[0]?.data || {}),
      processing_notes: [`Processed JSON data for ${category}`]
    };
  }

  findColumn(headers, candidates) {
    for (const candidate of candidates) {
      const found = headers.find(h => 
        h.toLowerCase().includes(candidate.toLowerCase())
      );
      if (found) return found;
    }
    return null;
  }

  standardizeDate(dateStr) {
    if (!dateStr) return null;
    
    const str = dateStr.toString().trim();
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    
    // Convert MM/DD/YYYY to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [mm, dd, yyyy] = str.split('/');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    
    // Convert MM-DD-YYYY to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [mm, dd, yyyy] = str.split('-');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    
    // Try parsing as Date and format
    try {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Could not parse date:', str);
    }
    
    return null;
  }

  standardizeTime(timeStr) {
    if (!timeStr) return null;
    
    const str = timeStr.toString().trim();
    
    // Already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(str)) {
      return str;
    }
    
    // Convert HH:MM:SS to HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
      return str.substring(0, 5);
    }
    
    // Handle other time formats
    try {
      const date = new Date(`1970-01-01T${str}`);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().substring(0, 5);
      }
    } catch (error) {
      console.warn('Could not parse time:', str);
    }
    
    return null;
  }

  extractCategoryData(row, headers, category) {
    const data = {};
    
    switch (category) {
      case 'fish_data':
        data.species = row[this.findColumn(headers, ['species', 'fish_species', 'scientific_name'])];
        data.length_cm = parseFloat(row[this.findColumn(headers, ['length', 'length_cm', 'size'])]) || null;
        data.weight_g = parseFloat(row[this.findColumn(headers, ['weight', 'weight_g', 'mass'])]) || null;
        data.abundance = parseInt(row[this.findColumn(headers, ['abundance', 'count', 'number'])]) || null;
        data.age = parseInt(row[this.findColumn(headers, ['age', 'age_years'])]) || null;
        data.notes = row[this.findColumn(headers, ['notes', 'comments', 'remarks'])];
        break;
        
      case 'ocean_data':
        data.temperature = parseFloat(row[this.findColumn(headers, ['temperature', 'temp', 'water_temp'])]) || null;
        data.salinity = parseFloat(row[this.findColumn(headers, ['salinity', 'sal', 'ppt'])]) || null;
        data.dissolved_oxygen = parseFloat(row[this.findColumn(headers, ['dissolved_oxygen', 'do', 'oxygen'])]) || null;
        data.pH = parseFloat(row[this.findColumn(headers, ['ph', 'pH', 'acidity'])]) || null;
        data.depth_m = parseFloat(row[this.findColumn(headers, ['depth', 'depth_m', 'water_depth'])]) || null;
        data.turbidity = parseFloat(row[this.findColumn(headers, ['turbidity', 'turb', 'ntu'])]) || null;
        data.notes = row[this.findColumn(headers, ['notes', 'comments', 'remarks'])];
        break;
        
      case 'eDNA_data':
        data.sequence_id = row[this.findColumn(headers, ['sequence_id', 'seq_id', 'dna_id'])];
        data.matched_species = row[this.findColumn(headers, ['matched_species', 'species_match', 'identified_species'])];
        data.notes = row[this.findColumn(headers, ['notes', 'comments', 'remarks'])];
        break;
        
      default:
        // Copy all data for unknown categories
        headers.forEach(header => {
          if (!['location', 'date', 'time'].includes(header.toLowerCase())) {
            data[header] = row[header];
          }
        });
    }
    
    return data;
  }

  async extractOtolithFeatures(imageData) {
    // Placeholder for otolith morphometric analysis
    // In a real implementation, you would use computer vision libraries
    
    try {
      // Basic image analysis using sharp
      const metadata = await sharp(imageData.path).metadata();
      
      // Mock morphometric calculations
      const area = metadata.width * metadata.height * 0.7; // Approximate otolith area
      const perimeter = 2 * Math.sqrt(Math.PI * area); // Approximate perimeter
      const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
      const aspect_ratio = metadata.width / metadata.height;
      const volume = area * 0.1; // Mock volume calculation
      
      return {
        circularity: Math.round(circularity * 100) / 100,
        area: Math.round(area),
        perimeter: Math.round(perimeter),
        aspect_ratio: Math.round(aspect_ratio * 100) / 100,
        volume: Math.round(volume)
      };
    } catch (error) {
      console.error('❌ Image feature extraction failed:', error);
      return {
        circularity: null,
        area: null,
        perimeter: null,
        aspect_ratio: null,
        volume: null
      };
    }
  }

  processJSONItem(item, category) {
    // Extract location, date, time from JSON item
    const location = item.location || item.site || item.station || 'Unknown';
    const date = this.standardizeDate(item.date || item.sampling_date);
    const time = this.standardizeTime(item.time || item.sampling_time);
    
    if (!date || !time) return null;
    
    return {
      location: location,
      date: date,
      time: time,
      data: this.extractCategoryData(item, Object.keys(item), category)
    };
  }
}

module.exports = new DataStandardizer();
