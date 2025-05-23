const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if userId is valid
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if userId is a valid MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar');
    
    if (!posts.length) {
      return res.status(200).json([]);
    }
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = post.views + 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      category,
      tags: tags || []
    });
    
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Comment on a post
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const { content, parentComment } = req.body;
    
    const newComment = new Comment({
      content,
      author: req.user.id,
      post: req.params.id
    });
    
    // If it's a reply to another comment
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      
      parentCommentDoc.replies.push(newComment._id);
      await parentCommentDoc.save();
    } else {
      // Regular comment (not a reply)
      post.comments.push(newComment._id);
      await post.save();
    }
    
    await newComment.save();
    
    // Populate the author information
    const populatedComment = await Comment.findById(newComment._id).populate('author', 'username avatar');
    
    res.json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/vote
// @desc    Vote on a post
// @access  Private
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const { voteType } = req.body;
    const userId = req.user.id;
    
    // Remove user from both upvotes and downvotes first
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
    
    // Then add to appropriate array based on voteType
    if (voteType === 'up') {
      post.upvotes.push(userId);
    } else if (voteType === 'down') {
      post.downvotes.push(userId);
    }
    
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });
    
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 