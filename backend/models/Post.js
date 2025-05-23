const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    content: {
        type: String,
        required: true,
        minlength: 20
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['General', 'Technology', 'Science', 'Arts', 'Sports', 'Other']
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    isSolved: {
        type: Boolean,
        default: false
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

// Virtual for vote count
postSchema.virtual('voteCount').get(function() {
    return this.upvotes.length - this.downvotes.length;
});

// Method to check if user has voted
postSchema.methods.hasVoted = function(userId) {
    return this.upvotes.includes(userId) || this.downvotes.includes(userId);
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 