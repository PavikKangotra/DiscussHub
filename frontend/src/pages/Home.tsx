import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import InitialsAvatar from '../components/InitialsAvatar';
import { generateColor, getFirstLetter, getInitialsAvatar, createUniqueIdentifier } from '../utils/avatarUtils';

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
  comments: string[];
  createdAt: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const { user } = useAuth() as { user: any; loading: boolean; login: any; register: any; logout: any; };

  useEffect(() => {
    fetchPosts();
  }, [category, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/posts`, {
        params: {
          category: category !== 'all' ? category : undefined,
          sort: sortBy,
        },
      });
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      // Prompt user to login
      alert('Please login to vote');
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/vote`,
        { voteType },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Vote response:', response.data);
      
      // Update posts state with the updated post
      setPosts(posts.map((post: Post) => 
        post._id === postId ? response.data : post
      ));
    } catch (err: any) {
      console.error('Voting error:', err.response?.data || err.message);
      alert('Failed to vote. Please try again.');
    }
  };

  const WelcomeBanner = () => (
    <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white rounded-lg shadow-lg mb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
        {/* Background pattern for added visual interest */}
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 600 400">
            <path stroke="currentColor" strokeWidth="2" d="M0 0l600 400M0 80l600 320M0 160l600 240M0 240l600 160M0 320l600 80M0 400l600 0" />
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="mb-8 md:mb-0 md:mr-8 md:max-w-lg">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-shadow">Welcome to DiscussHub!</h2>
            <p className="text-lg text-white max-w-2xl mb-6">
              A community-driven platform for discussions, knowledge sharing, and connecting with like-minded people.
            </p>
            {!user && (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-white text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-5 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <img 
              src="https://img.freepik.com/free-vector/online-community-concept-illustration_114360-5206.jpg" 
              alt="Community Discussion" 
              className="h-60 w-auto rounded-lg shadow-xl border-4 border-white" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 className="mt-4 text-xl font-medium text-gray-900">No discussions yet</h3>
      <p className="mt-2 text-gray-500">Be the first to start a discussion in this community!</p>
      {user ? (
        <Link
          to="/create-post"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Create New Post
        </Link>
      ) : (
        <Link
          to="/login"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Login to Post
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBanner />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBanner />
        <div className="text-center text-red-600 p-4 bg-white rounded-lg shadow">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeBanner />
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 w-full sm:w-auto"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>
          {user && (
            <Link
              to="/create-post"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Post
            </Link>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {posts.map((post: Post) => {
            // Debug post author data
            console.log(`Post ${post._id} author:`, post.author);
            console.log(`Username: ${post.author?.username}, First letter: ${post.author?.username ? getFirstLetter(post.author.username) : 'No username'}`);
            
            return (
            <div
              key={post._id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <InitialsAvatar 
                        username={post.author?.username || createUniqueIdentifier(post._id)} 
                        size="40px"
                        className="border border-gray-200"
                      />
                    )}
                    <div>
                      <Link
                        to={`/profile/${post.author?._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {post.author?.username || createUniqueIdentifier(post._id)}
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
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {post.category}
                  </span>
                </div>
                <Link to={`/post/${post._id}`} className="mt-4 block">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-600 line-clamp-3">{post.content}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(post._id, 'up')}
                      className="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
                      disabled={!user}
                    >
                      <svg
                        className="h-5 w-5"
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
                      <span>{post.upvotes.length - post.downvotes.length}</span>
                    </button>
                    <button
                      onClick={() => handleVote(post._id, 'down')}
                      className="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
                      disabled={!user}
                    >
                      <svg
                        className="h-5 w-5"
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
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments.length}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-x-2">
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home; 