import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import InitialsAvatar from '../components/InitialsAvatar';
import { generateColor, getFirstLetter, getInitialsAvatar } from '../utils/avatarUtils';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  replies: Comment[];
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  comments: Comment[];
  createdAt: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth() as { user: any; loading: boolean; login: any; register: any; logout: any; };
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
    } catch (err: any) {
      console.error('Error fetching post:', err.response?.data || err.message);
      setError('Failed to fetch post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'post' | 'comment', id: string, voteType: 'up' | 'down') => {
    if (!user) {
      // Prompt user to login
      navigate('/login');
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        navigate('/login');
        return;
      }

      const endpoint = type === 'post' ? `/api/posts/${id}/vote` : `/api/comments/${id}/vote`;
      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        { voteType },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Vote response:', response.data);

      if (type === 'post') {
        setPost(response.data);
      } else {
        setPost(prev => {
          if (!prev) return null;
          const updateComments = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c._id === id) return response.data;
              if (c.replies.length) {
                return { ...c, replies: updateComments(c.replies) };
              }
              return c;
            });
          };
          return { ...prev, comments: updateComments(prev.comments) };
        });
      }
    } catch (err: any) {
      console.error('Voting error:', err.response?.data || err.message);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`http://localhost:5000/api/posts/${id}/comments`, {
        content: comment,
        parentComment: replyTo,
      });

      setPost(prev => {
        if (!prev) return null;
        if (replyTo) {
          const updateComments = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c._id === replyTo) {
                return { ...c, replies: [...c.replies, response.data] };
              }
              if (c.replies.length) {
                return { ...c, replies: updateComments(c.replies) };
              }
              return c;
            });
          };
          return { ...prev, comments: updateComments(prev.comments) };
        }
        return { ...prev, comments: [...prev.comments, response.data] };
      });

      setComment('');
      setReplyTo(null);
      setReplyToUser('');
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo(commentId);
    setReplyToUser(username);
    // Focus on the comment input
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.focus();
      // Scroll to comment input
      commentInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyToUser('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment._id} className={`${isReply ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : 'mt-6 border-b border-gray-100 pb-4'}`}>
      <div className="flex items-start space-x-3">
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt=""
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-gray-200" 
            style={{ 
              backgroundColor: generateColor(comment.author?.username || 'Anonymous') 
            }}
          >
            {getFirstLetter(comment.author?.username)}
          </div>
        )}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg px-4 py-2">
            <div className="flex items-center justify-between">
              <Link
                to={`/profile/${comment.author?._id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {comment.author?.username || 'Anonymous User'}
              </Link>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="mt-1 text-gray-700">{comment.content}</p>
          </div>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => handleVote('comment', comment._id, 'up')}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
              disabled={!user}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span>{comment.upvotes.length - comment.downvotes.length}</span>
            </button>
            <button
              onClick={() => handleVote('comment', comment._id, 'down')}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
              disabled={!user}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {user && !isReply && (
              <button
                onClick={() => handleReply(comment._id, comment.author?.username || 'Anonymous')}
                className="text-xs text-gray-500 hover:text-primary-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            )}
          </div>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">Post Not Found</h2>
          <p className="mt-2 text-gray-500">{error || 'The post you are looking for does not exist or has been removed.'}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white shadow rounded-lg overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between">
            <div className="flex items-center space-x-3">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold border border-gray-200" 
                  style={{ 
                    backgroundColor: generateColor(post.author?.username || 'Anonymous') 
                  }}
                >
                  {getFirstLetter(post.author?.username)}
                </div>
              )}
              <div>
                <Link
                  to={`/profile/${post.author?._id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  {post.author?.username || 'Anonymous User'}
                </Link>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {post.category}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.views}
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">{post.title}</h1>
          
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Post Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
          
          {/* Post Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote('post', post._id, 'up')}
                  className={`flex items-center space-x-1 ${
                    user && post.upvotes.includes(user._id) 
                      ? 'text-primary-600' 
                      : 'text-gray-500 hover:text-primary-600'
                  }`}
                  disabled={!user}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span className="text-lg font-medium">{post.upvotes.length - post.downvotes.length}</span>
                </button>
                <button
                  onClick={() => handleVote('post', post._id, 'down')}
                  className={`flex items-center space-x-1 ${
                    user && post.downvotes.includes(user._id) 
                      ? 'text-red-600' 
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                  disabled={!user}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.comments.length} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments ({post.comments.length})</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-8">
            <div className="relative">
              {replyTo && (
                <div className="mb-2 bg-blue-50 p-2 rounded-md flex justify-between items-center text-sm">
                  <span>Replying to <strong>{replyToUser}</strong></span>
                  <button 
                    type="button" 
                    onClick={cancelReply}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <textarea
                id="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={user ? "Add a comment..." : "Login to comment"}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                rows={4}
                disabled={!user || isSubmitting}
              />
              <div className="mt-2 flex justify-end">
                {user ? (
                  <button
                    type="submit"
                    disabled={!comment.trim() || isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Login to Comment
                  </Link>
                )}
              </div>
            </div>
          </form>
          
          {post.comments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {post.comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default PostDetail; 