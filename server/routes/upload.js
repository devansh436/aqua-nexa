const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// ✅ Complete file filter supporting ALL formats
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File filter check:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
    
    // ✅ ALL supported extensions
    const allowedExtensions = [
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg',
      // Spreadsheets
      '.csv', '.xlsx', '.xls',
      // Documents
      '.pdf', '.doc', '.docx', '.txt',
      // Data formats
      '.json', '.xml',
      // Archives
      '.zip', '.rar',
      // Scientific
      '.nc', '.nc4', '.h5', '.hdf5', '.mat'
    ];
    
    const allowedMimeTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp',
      // Text/CSV
      'text/csv', 'application/csv', 'text/plain',
      // Excel
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Data
      'application/json', 'application/xml', 'text/xml',
      // Archives
      'application/zip',
      // Scientific
      'application/x-netcdf', 'application/octet-stream'
    ];
    
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
      console.log('✅ File accepted:', ext, file.mimetype);
      cb(null, true);
    } else {
      console.log('❌ File rejected:', ext, file.mimetype);
      cb(new Error(`File type ${ext} not supported. Supported: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Routes
router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/status/:fileId', uploadController.getFileStatus);
router.get('/metadata/:fileId', uploadController.getFileMetadata);
router.get('/search', uploadController.searchFiles);

// Error handling
router.use((error, req, res, next) => {
  console.error('❌ Upload error:', error.message);
  
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Upload failed'
  });
});

module.exports = router;
