const express = require('express');
const multer = require('multer');
const {
  uploadFile,
  getUnifiedDatasets,
  exportUnifiedDataset,
  getFileData,
  getMetadataList
} = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp',
      'application/json'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.csv')) cb(null, true);
    else cb(new Error('Unsupported file type for marine research data'), false);
  }
});

router.post('/', upload.single('file'), uploadFile);
router.get('/unified', getUnifiedDatasets);
router.get('/export', exportUnifiedDataset);
router.get('/file/:fileId', getFileData);
router.get('/metadata', getMetadataList);

module.exports = router;
