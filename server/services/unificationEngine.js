const UnifiedDataset = require('../models/UnifiedDataset');
const DataFile = require('../models/DataFile');

class UnificationEngine {
  constructor() {
    this.TIME_TOLERANCE = 5; // 5 minutes tolerance
  }

  async unifyDatasets(fileId) {
    try {
      console.log('🔄 Starting unification process for file:', fileId);
      
      const file = await DataFile.findById(fileId);
      if (!file || !file.extractedMetadata?.standardized_data) {
        throw new Error('File or standardized data not found');
      }

      const records = file.extractedMetadata.standardized_data.records;
      const unifiedRecords = [];

      for (const record of records) {
        const { location, date, time, data } = record;
        
        if (!location || !date || !time) {
          console.log('⚠️ Skipping record with missing location/date/time');
          continue;
        }

        // Find or create unified record
        let unifiedRecord = await this.findOrCreateUnifiedRecord(location, date, time);
        
        // Merge data based on file category
        unifiedRecord = await this.mergeDataByCategory(
          unifiedRecord, 
          data, 
          file.category, 
          file._id, 
          file.originalName
        );

        unifiedRecords.push(unifiedRecord);
      }

      console.log(`✅ Unified ${unifiedRecords.length} records`);
      return unifiedRecords;
      
    } catch (error) {
      console.error('❌ Unification failed:', error);
      throw error;
    }
  }

  async findOrCreateUnifiedRecord(location, date, time) {
    // Normalize location name
    const normalizedLocation = this.normalizeLocation(location);
    
    // Try exact match first
    let record = await UnifiedDataset.findOne({
      location: normalizedLocation,
      date: date,
      time: time
    });

    if (!record) {
      // Try fuzzy time matching (±5 minutes)
      record = await this.findWithTimeRange(normalizedLocation, date, time);
    }

    if (!record) {
      // Create new record
      record = new UnifiedDataset({
        location: normalizedLocation,
        date: date,
        time: time,
        metadata_refs: []
      });
    }

    return record;
  }

  async findWithTimeRange(location, date, timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetMinutes = hours * 60 + minutes;
    
    const records = await UnifiedDataset.find({
      location: location,
      date: date
    });

    for (const record of records) {
      const [recHours, recMinutes] = record.time.split(':').map(Number);
      const recTotalMinutes = recHours * 60 + recMinutes;
      
      if (Math.abs(targetMinutes - recTotalMinutes) <= this.TIME_TOLERANCE) {
        return record;
      }
    }

    return null;
  }

  async mergeDataByCategory(unifiedRecord, data, category, fileId, fileName) {
    // Add metadata reference
    if (!unifiedRecord.metadata_refs.some(ref => ref.file_id.equals(fileId))) {
      unifiedRecord.metadata_refs.push({
        file_id: fileId,
        file_name: fileName,
        data_type: category
      });
    }

    // Merge data based on category
    switch (category) {
      case 'fish_data':
        unifiedRecord.fish = {
          species: data.species || 'N/A',
          length_cm: this.parseNumber(data.length_cm),
          weight_g: this.parseNumber(data.weight_g),
          abundance: this.parseNumber(data.abundance),
          age: this.parseNumber(data.age),
          notes: data.notes || ''
        };
        break;

      case 'ocean_data':
        unifiedRecord.ocean = {
          temperature: this.parseNumber(data.temperature),
          salinity: this.parseNumber(data.salinity),
          dissolved_oxygen: this.parseNumber(data.dissolved_oxygen),
          pH: this.parseNumber(data.pH),
          depth_m: this.parseNumber(data.depth_m),
          turbidity: this.parseNumber(data.turbidity),
          notes: data.notes || ''
        };
        break;

      case 'otolith_image':
        unifiedRecord.otolith_features = {
          image_file: data.image_file || fileName,
          circularity: this.parseNumber(data.circularity),
          area: this.parseNumber(data.area),
          perimeter: this.parseNumber(data.perimeter),
          aspect_ratio: this.parseNumber(data.aspect_ratio),
          volume: this.parseNumber(data.volume),
          notes: data.notes || ''
        };
        break;

      case 'eDNA_data':
        unifiedRecord.eDNA = {
          sequence_id: data.sequence_id || 'N/A',
          matched_species: data.matched_species || 'N/A',
          notes: data.notes || ''
        };
        break;
    }

    unifiedRecord.processing_status = 'completed';
    await unifiedRecord.save();
    return unifiedRecord;
  }

  normalizeLocation(location) {
    return location.trim().replace(/\s+/g, ' ');
  }

  parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  async getUnifiedDatasets(filters = {}) {
    try {
      const query = {};
      
      if (filters.location) {
        query.location = new RegExp(filters.location, 'i');
      }
      
      if (filters.dateRange) {
        query.date = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end
        };
      }

      const datasets = await UnifiedDataset.find(query)
        .populate('metadata_refs.file_id', 'originalName uploadDate fileType')
        .sort({ date: -1, time: -1 })
        .limit(filters.limit || 100);

      return datasets;
    } catch (error) {
      console.error('❌ Failed to get unified datasets:', error);
      throw error;
    }
  }

  async exportUnifiedDataset(format = 'json') {
    try {
      const datasets = await UnifiedDataset.find({})
        .populate('metadata_refs.file_id', 'originalName uploadDate fileType')
        .sort({ date: -1, time: -1 });

      if (format === 'csv') {
        return this.convertToCSV(datasets);
      }
      
      return datasets;
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  convertToCSV(datasets) {
    const headers = [
      'location', 'date', 'time',
      'fish_species', 'fish_length_cm', 'fish_weight_g', 'fish_abundance', 'fish_age',
      'ocean_temperature', 'ocean_salinity', 'ocean_dissolved_oxygen', 'ocean_pH', 'ocean_depth_m', 'ocean_turbidity',
      'otolith_circularity', 'otolith_area', 'otolith_perimeter', 'otolith_aspect_ratio', 'otolith_volume',
      'eDNA_sequence_id', 'eDNA_matched_species',
      'metadata_files'
    ];

    const rows = datasets.map(record => [
      record.location,
      record.date,
      record.time,
      record.fish?.species || 'N/A',
      record.fish?.length_cm || 'N/A',
      record.fish?.weight_g || 'N/A',
      record.fish?.abundance || 'N/A',
      record.fish?.age || 'N/A',
      record.ocean?.temperature || 'N/A',
      record.ocean?.salinity || 'N/A',
      record.ocean?.dissolved_oxygen || 'N/A',
      record.ocean?.pH || 'N/A',
      record.ocean?.depth_m || 'N/A',
      record.ocean?.turbidity || 'N/A',
      record.otolith_features?.circularity || 'N/A',
      record.otolith_features?.area || 'N/A',
      record.otolith_features?.perimeter || 'N/A',
      record.otolith_features?.aspect_ratio || 'N/A',
      record.otolith_features?.volume || 'N/A',
      record.eDNA?.sequence_id || 'N/A',
      record.eDNA?.matched_species || 'N/A',
      record.metadata_refs.map(ref => ref.file_name).join('; ')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

module.exports = new UnificationEngine();
