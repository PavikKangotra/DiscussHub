const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
    return this.upvotes.length - this.downvotes.length;
});

// Method to check if user has voted
commentSchema.methods.hasVoted = function(userId) {
    return this.upvotes.includes(userId) || this.downvotes.includes(userId);
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 