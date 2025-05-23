const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = new Comment({
      content,
      post: req.params.postId,
      user: req.user.id
    });
    
    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/comments/:id/vote
// @desc    Vote on a comment
// @access  Private
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const { voteType } = req.body;
    const userId = req.user.id;
    
    // Remove user from both upvotes and downvotes first
    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
    
    // Then add to appropriate array based on voteType
    if (voteType === 'up') {
      comment.upvotes.push(userId);
    } else if (voteType === 'down') {
      comment.downvotes.push(userId);
    }
    
    await comment.save();
    
    // Populate the author information
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');
    
    res.json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 