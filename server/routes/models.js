const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const Model = require('../models/Model');
const Comment = require('../models/Comment');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.glb', '.gltf', '.obj'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .glb, .gltf, .obj files are allowed'));
  },
});

// GET /api/models - list all (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'latest'; // latest | top
    const category = req.query.category;

    const query = category ? { category } : {};
    const sortOption = sort === 'top' ? { likes: -1, views: -1 } : { createdAt: -1 };

    const models = await Model.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username avatar');

    const total = await Model.countDocuments(query);

    res.json({ models, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/models/top - top models by likes
router.get('/top', async (req, res) => {
  try {
    const models = await Model.find()
      .sort({ views: -1 })
      .limit(8)
      .populate('author', 'username avatar');
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/models/latest - latest models
router.get('/latest', async (req, res) => {
  try {
    const models = await Model.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('author', 'username avatar');
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/models/:id - single model
router.get('/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id).populate('author', 'username avatar bio');
    if (!model) return res.status(404).json({ message: 'Model not found' });

    // increment views
    model.views += 1;
    await model.save();

    res.json(model);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/models/:id/similar - similar models by category
router.get('/:id/similar', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const similar = await Model.find({
      category: model.category,
      _id: { $ne: model._id },
    })
      .sort({ views: -1 })
      .limit(6)
      .populate('author', 'username avatar');

    res.json(similar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/models - upload new model (protected)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, tags } = req.body;
    const ext = path.extname(req.file.filename).replace('.', '');

    const model = new Model({
      title,
      description,
      category: category || 'Other',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileFormat: ext,
      author: req.user.userId,
    });

    await model.save();
    await model.populate('author', 'username avatar');

    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/models/:id/like - toggle like (protected)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const userId = req.user.userId;
    const idx = model.likes.indexOf(userId);

    if (idx === -1) {
      model.likes.push(userId);
    } else {
      model.likes.splice(idx, 1);
    }

    await model.save();
    res.json({ likes: model.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/models/:id (protected, owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });
    if (model.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // delete file
    const filePath = path.join(__dirname, '..', model.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await model.deleteOne();
    await Comment.deleteMany({ model: model._id });

    res.json({ message: 'Model deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
