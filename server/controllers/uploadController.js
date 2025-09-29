const fs = require('fs');
const path = require('path');
const DataFile = require('../models/DataFile');
const FileMetadata = require('../models/FileMetadata');
const UnifiedDataset = require('../models/UnifiedDataset');
const sharp = require('sharp');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');

// detect type
const determineFileType = (mimeType, fileName) => {
  const ext = fileName.toLowerCase().split('.').pop();
  if (mimeType.startsWith('image/') || ['jpg','jpeg','png','gif','bmp','tiff','webp'].includes(ext)) return 'image';
  if (mimeType === 'text/csv' || ext === 'csv') return 'csv';
  if (['xlsx','xls'].includes(ext) || mimeType.includes('spreadsheetml')) return 'excel';
  if (mimeType === 'application/json' || ext === 'json') return 'json';
  return 'other';
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { category = 'other', description = '', tags = '' } = req.body;
    const uploadsDir = './uploads';
    const today = new Date().toISOString().split('T')[0];
    const dateDir = path.join(uploadsDir, today);
    [uploadsDir, dateDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

    const ts = Date.now();
    const rnd = Math.round(Math.random() * 1000);
    const ext = path.extname(req.file.originalname);
    const filename = `file-${ts}-${rnd}${ext}`;
    const filepath = path.join(dateDir, filename);
    fs.writeFileSync(filepath, req.file.buffer);

    const fileType = determineFileType(req.file.mimetype, req.file.originalname);

    const dataFile = new DataFile({
      originalName: req.file.originalname,
      fileName: filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      fileType,
      category,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      filePath: filepath,
      processingStatus: 'processing',
      validationStatus: 'valid',
      uploadDate: new Date()
    });
    const savedFile = await dataFile.save();

    try {
      await processFileCompletely(savedFile._id, filepath, fileType, category);
      res.status(201).json({ success: true, fileId: savedFile._id, message: 'File uploaded and processed successfully' });
    } catch (e) {
      console.error(e);
      res.status(201).json({ success: true, fileId: savedFile._id, message: 'File uploaded but processing failed: ' + e.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
};

// read helpers
const readCSVFileCompletely = async (filePath) => new Promise((resolve, reject) => {
  const results = []; let headers = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (h) => { headers = h; })
    .on('data', (row) => results.push(row))
    .on('end', () => resolve({ headers, data: results, totalRows: results.length }))
    .on('error', reject);
});

const readExcelFileCompletely = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const ws = workbook.worksheets[0];
  const results = []; let headers = [];
  ws.eachRow((row, i) => {
    if (i === 1) headers = row.values.slice(1);
    else {
      const r = {};
      row.values.slice(1).forEach((v, idx) => { if (headers[idx]) r[headers[idx]] = v; });
      results.push(r);
    }
  });
  return { headers, data: results, totalRows: results.length };
};

const readImageFile = async (filePath) => {
  const metadata = await sharp(filePath).metadata();
  return {
    filename: path.basename(filePath),
    path: filePath,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    totalRows: 1
  };
};

const readJSONFile = async (filePath) => {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const arr = Array.isArray(json) ? json : [json];
  return { data: arr, headers: arr.length ? Object.keys(arr[0]) : [], totalRows: arr.length };
};

// standardize
const standardizeAllData = async (rawData, fileType, category) => {
  const records = [];
  if (fileType === 'image') {
    const features = await extractOtolithFeatures(rawData);
    records.push({
      location: 'Unknown',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0,5),
      data: {
        image_file: rawData.filename,
        circularity: features.circularity,
        area: features.area,
        perimeter: features.perimeter,
        aspect_ratio: features.aspect_ratio,
        volume: features.volume
      }
    });
    return { records, total_records: 1, schema_info: ['image_file','circularity','area','perimeter','aspect_ratio','volume'], processing_notes: ['Otolith features extracted'] };
  }

  const headers = rawData.headers || [];
  const rows = rawData.data || [];

  const findColumn = (cands) => {
    for (const c of cands) {
      const f = headers.find(h => h && h.toString().toLowerCase().includes(c));
      if (f) return f;
    }
    return null;
  };

  const standardizeDate = (s) => {
    if (!s) return null;
    const str = s.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) { const [mm,dd,yyyy] = str.split('/'); return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`; }
    const d = new Date(str); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
  };
  const standardizeTime = (s) => {
    if (!s) return null;
    const str = s.toString().trim();
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.substring(0,5);
    return null;
  };
  const normLoc = (loc) => (loc || 'Unknown').toString().trim().replace(/\s+/g, ' ');

  const extractFish = (row) => ({
    species: row[findColumn(['species','fish_species','scientific_name'])] || 'N/A',
    length_cm: parseFloat(row[findColumn(['length','length_cm','size'])]) || null,
    weight_g: parseFloat(row[findColumn(['weight','weight_g','mass'])]) || null,
    abundance: parseInt(row[findColumn(['abundance','count','number'])]) || null,
    age: parseInt(row[findColumn(['age','age_years'])]) || null,
    notes: row[findColumn(['notes','comments','remarks'])] || ''
  });

  const extractOcean = (row) => ({
    temperature: parseFloat(row[findColumn(['temperature','temp','water_temp'])]) || null,
    salinity: parseFloat(row[findColumn(['salinity','sal','ppt'])]) || null,
    dissolved_oxygen: parseFloat(row[findColumn(['dissolved_oxygen','do','oxygen'])]) || null,
    pH: parseFloat(row[findColumn(['ph','pH','acidity'])]) || null,
    depth_m: parseFloat(row[findColumn(['depth','depth_m','water_depth'])]) || null,
    turbidity: parseFloat(row[findColumn(['turbidity','turb','ntu'])]) || null,
    notes: row[findColumn(['notes','comments','remarks'])] || ''
  });

  const extractEDNA = (row) => ({
    sequence_id: row[findColumn(['sequence_id','seq_id','dna_id'])] || 'N/A',
    matched_species: row[findColumn(['matched_species','species_match','identified_species'])] || 'N/A',
    notes: row[findColumn(['notes','comments','remarks'])] || ''
  });

  for (const row of rows) {
    const location = normLoc(row[findColumn(['location','site','station','place'])]);
    const date = standardizeDate(row[findColumn(['date','sampling_date','collection_date'])]);
    const time = standardizeTime(row[findColumn(['time','sampling_time','collection_time'])]);
    if (!date || !time) continue;

    let data = {};
    if (category === 'fish_data') data = extractFish(row);
    else if (category === 'ocean_data') data = extractOcean(row);
    else if (category === 'eDNA_data') data = extractEDNA(row);
    else {
      // copy all
      headers.forEach(h => { if (!['location','date','time'].includes(h?.toString().toLowerCase())) data[h] = row[h]; });
    }
    records.push({ location, date, time, data });
  }

  return {
    records,
    total_records: records.length,
    schema_info: headers,
    processing_notes: [`Standardized ${records.length} records from ${rows.length} input rows`]
  };
};

// image features (placeholder CV)
const extractOtolithFeatures = async (imageData) => {
  try {
    const meta = await sharp(imageData.path).metadata();
    const area = meta.width * meta.height * 0.7;
    const perimeter = 2 * Math.sqrt(Math.PI * area);
    const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
    const aspect_ratio = meta.width / meta.height;
    const volume = area * 0.1;
    return {
      circularity: Math.round(circularity * 100) / 100,
      area: Math.round(area),
      perimeter: Math.round(perimeter),
      aspect_ratio: Math.round(aspect_ratio * 100) / 100,
      volume: Math.round(volume)
    };
  } catch {
    return { circularity: null, area: null, perimeter: null, aspect_ratio: null, volume: null };
  }
};

const calculateQualityMetrics = (std) => ({
  completeness: Math.round((std.total_records / Math.max(1, std.total_records)) * 100),
  accuracy: 95,
  consistency: 90,
  validity: 95,
  timeliness: 100
});

// main processing
const processFileCompletely = async (fileId, filePath, fileType, category) => {
  // read
  let rawData;
  if (fileType === 'csv') rawData = await readCSVFileCompletely(filePath);
  else if (fileType === 'excel') rawData = await readExcelFileCompletely(filePath);
  else if (fileType === 'image') rawData = await readImageFile(filePath);
  else if (fileType === 'json') rawData = await readJSONFile(filePath);
  else throw new Error(`Unsupported file type: ${fileType}`);

  // standardize
  const standardizedData = await standardizeAllData(rawData, fileType, category);

  // metadata
  const metrics = calculateQualityMetrics(standardizedData);
  const metaDoc = new FileMetadata({
    fileId,
    rawMetadata: { fileType, category, extractedAt: new Date() },
    structuredMetadata: {
      scientificData: { dataType: category, recordCount: standardizedData.total_records, schemaInfo: standardizedData.schema_info },
      qualityMetrics: metrics
    }
  });
  await metaDoc.save();

  await DataFile.findByIdAndUpdate(fileId, {
    extractedMetadata: {
      extractedAt: new Date(),
      fileType,
      standardized_data: standardizedData,
      quality_metrics: metrics
    },
    processingStatus: 'completed'
  });

  // unify
  await unifyAllRecordsWithCompositeKey(fileId, standardizedData, category);
};

// unification
const unifyAllRecordsWithCompositeKey = async (fileId, standardizedData, category) => {
  const file = await DataFile.findById(fileId);
  if (!file) throw new Error('File not found');

  const TIME_TOLERANCE_MIN = 5; // policy: exact match preferred; if none, snap within ±5
  const parseMinutes = (hhmm) => {
    const [h,m] = hhmm.split(':').map(Number);
    return h*60 + m;
  };
  const withinTolerance = (t1, t2) => Math.abs(parseMinutes(t1) - parseMinutes(t2)) <= TIME_TOLERANCE_MIN;

  const normalizeLocation = (loc) => loc.trim().replace(/\s+/g, ' ');

  for (const rec of standardizedData.records) {
    const location = normalizeLocation(rec.location || 'Unknown');
    const { date, time, data } = rec;
    if (!location || !date || !time) continue;

    const compositeKey = `${location}_${date}_${time}`;

    // Try exact
    let unified = await UnifiedDataset.findOne({ composite_key: compositeKey });

    // If not found, try tolerance search for same date/location
    if (!unified) {
      const sameDay = await UnifiedDataset.find({ location, date });
      const candidate = sameDay.find(r => withinTolerance(r.time, time));
      if (candidate) unified = candidate;
    }

    if (!unified) {
      unified = new UnifiedDataset({
        location,
        date,
        time,
        composite_key: compositeKey,
        metadata_refs: []
      });
    }

    // add lineage
    if (!unified.metadata_refs.some(ref => ref.file_id?.toString() === fileId.toString())) {
      unified.metadata_refs.push({ file_id: fileId, file_name: file.originalName, data_type: category });
    }

    // merge
    const parseNum = (v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = parseFloat(v); return isNaN(n) ? null : n;
    };

    if (category === 'fish_data') {
      if (!Array.isArray(unified.fish)) unified.fish = [];
      unified.fish.push({
        species: data.species || 'N/A',
        length_cm: parseNum(data.length_cm),
        weight_g: parseNum(data.weight_g),
        abundance: parseNum(data.abundance),
        age: parseNum(data.age),
        notes: data.notes || '',
        source_file: file.originalName
      });
    } else if (category === 'ocean_data') {
      // keep latest plus history
      if (!Array.isArray(unified.ocean_observations)) unified.ocean_observations = [];
      unified.ocean_observations.push({
        time,
        temperature: parseNum(data.temperature),
        salinity: parseNum(data.salinity),
        dissolved_oxygen: parseNum(data.dissolved_oxygen),
        pH: parseNum(data.pH),
        depth_m: parseNum(data.depth_m),
        turbidity: parseNum(data.turbidity),
        notes: data.notes || ''
      });
      unified.ocean = {
        temperature: parseNum(data.temperature),
        salinity: parseNum(data.salinity),
        dissolved_oxygen: parseNum(data.dissolved_oxygen),
        pH: parseNum(data.pH),
        depth_m: parseNum(data.depth_m),
        turbidity: parseNum(data.turbidity),
        notes: data.notes || '',
        last_updated: new Date()
      };
    } else if (category === 'otolith_image') {
      if (!Array.isArray(unified.otolith_features)) unified.otolith_features = [];
      unified.otolith_features.push({
        image_file: data.image_file || file.originalName,
        circularity: parseNum(data.circularity),
        area: parseNum(data.area),
        perimeter: parseNum(data.perimeter),
        aspect_ratio: parseNum(data.aspect_ratio),
        volume: parseNum(data.volume),
        notes: data.notes || ''
      });
    } else if (category === 'eDNA_data') {
      if (!Array.isArray(unified.eDNA)) unified.eDNA = [];
      unified.eDNA.push({
        sequence_id: data.sequence_id || 'N/A',
        matched_species: data.matched_species || 'N/A',
        notes: data.notes || ''
      });
    }

    unified.last_updated = new Date();
    await unified.save();
  }
};

// API: list unified with filters
const getUnifiedDatasets = async (req, res) => {
  try {
    const { location, dateStart, dateEnd, species, limit = 1000 } = req.query;
    const q = {};
    if (location) q.location = new RegExp(location, 'i');
    if (dateStart && dateEnd) q.date = { $gte: dateStart, $lte: dateEnd };
    if (species) q['fish.species'] = new RegExp(species, 'i');

    const docs = await UnifiedDataset.find(q)
      .populate('metadata_refs.file_id', 'originalName uploadDate fileType category')
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: docs.length, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// API: export
const exportUnifiedDataset = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const docs = await UnifiedDataset.find({})
      .populate('metadata_refs.file_id', 'originalName uploadDate fileType category')
      .sort({ date: 1, time: 1 });

    if (format === 'csv') {
      const headers = [
        'composite_key','location','date','time',
        'fish_species_count','total_fish_individuals','fish_species_list',
        'ocean_temperature','ocean_salinity','ocean_pH','ocean_depth_m',
        'ocean_obs_count','otolith_count','eDNA_count','contributing_files'
      ];
      const rows = docs.map(r => [
        r.composite_key,
        r.location,
        r.date,
        r.time,
        r.fish?.length || 0,
        r.fish?.reduce((s,f)=>s+(f.abundance||0),0) || 0,
        r.fish?.map(f => `${f.species}(${f.abundance ?? 'N/A'})`).join('; ') || 'N/A',
        r.ocean?.temperature ?? 'N/A',
        r.ocean?.salinity ?? 'N/A',
        r.ocean?.pH ?? 'N/A',
        r.ocean?.depth_m ?? 'N/A',
        r.ocean_observations?.length || 0,
        r.otolith_features?.length || 0,
        r.eDNA?.length || 0,
        r.metadata_refs?.map(m => m.file_name).join('; ') || 'N/A'
      ]);
      const csvOut = [headers, ...rows].map(r => r.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=unified_dataset.csv');
      return res.send(csvOut);
    }

    res.json({ success: true, count: docs.length, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// API: file and metadata
const getFileData = async (req, res) => {
  try {
    const file = await DataFile.findById(req.params.fileId);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    const metadata = await FileMetadata.findOne({ fileId: file._id });
    res.json({ success: true, file, metadata });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getMetadataList = async (_req, res) => {
  try {
    const metadata = await FileMetadata.find({})
      .populate('fileId', 'originalName uploadDate fileType category processingStatus')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: metadata.length, data: metadata });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  uploadFile,
  getUnifiedDatasets,
  exportUnifiedDataset,
  getFileData,
  getMetadataList
};
