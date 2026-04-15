const prisma = require('../utils/prisma');
const { logTask } = require('../utils/logger');

const uploadArtwork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const newArtwork = await prisma.artwork.create({
      data: {
        title: title || req.file.originalname,
        fileUrl,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        userId: req.user.id
      }
    });

    // Log Activity
    await logTask(req.user.id, "Upload Artwork", "Success", `Uploaded design: ${req.file.originalname}`);

    res.json(newArtwork);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getArtworks = async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      where: { userId: req.user.id }
    });
    res.json(artworks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteArtwork = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Invalid artwork ID' });

    const artwork = await prisma.artwork.findUnique({
      where: { id }
    });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from disk
    const path = require('path');
    const fs = require('fs');
    // artwork.fileUrl is like "/uploads/filename.png"
    // We need the absolute path. The uploads dir is in server root.
    const filePath = path.join(__dirname, '../../', artwork.fileUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.artwork.delete({
      where: { id: req.params.id }
    });

    // Log Activity
    await logTask(req.user.id, "Delete Artwork", "Success", `Deleted artwork: ${artwork.title}`);

    res.json({ message: 'Artwork removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateArtwork = async (req, res) => {
  try {
    const { title } = req.body;
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id }
    });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const id = req.params.id;
    const updatedArtwork = await prisma.artwork.update({
      where: { id },
      data: { title: title || artwork.title }
    });

    res.json(updatedArtwork);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  uploadArtwork,
  getArtworks,
  deleteArtwork,
  updateArtwork
};
