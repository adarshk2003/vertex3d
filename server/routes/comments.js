const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const Model = require('../models/Model');

// GET /api/comments/:modelId - get all comments for a model
router.get('/:modelId', async (req, res) => {
  try {
    const comments = await Comment.find({ model: req.params.modelId })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments/:modelId - add comment (protected)
router.post('/:modelId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const model = await Model.findById(req.params.modelId);
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const comment = new Comment({
      model: req.params.modelId,
      author: req.user.userId,
      text: text.trim(),
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    // Update comment count on model
    model.commentCount += 1;
    await model.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/comments/:commentId - delete comment (owner only)
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();

    // Decrement comment count
    await Model.findByIdAndUpdate(comment.model, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
