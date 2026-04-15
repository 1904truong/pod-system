const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadArtwork, getArtworks, deleteArtwork, updateArtwork } = require('../controllers/artworkController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST /api/artworks/upload
// @desc    Upload new artwork
// @access  Private
router.post('/upload', authMiddleware, upload.single('artwork'), uploadArtwork);

// @route   GET /api/artworks
// @desc    Get user's artworks
// @access  Private
router.get('/', authMiddleware, getArtworks);

// @route   DELETE /api/artworks/:id
// @desc    Delete artwork
// @access  Private
router.delete('/:id', authMiddleware, deleteArtwork);

// @route   PATCH /api/artworks/:id
// @desc    Update artwork title
// @access  Private
router.patch('/:id', authMiddleware, updateArtwork);

module.exports = router;
