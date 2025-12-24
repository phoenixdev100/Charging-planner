const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const visualizationController = require('../controllers/visualizationController');
const authMiddleware = require('../middleware/authMiddleware');

const tempDir = path.join(__dirname, '..', 'uploads', 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

router.post('/3d-layout', authMiddleware, upload.array('images'), visualizationController.generate3DLayout);

module.exports = router;
