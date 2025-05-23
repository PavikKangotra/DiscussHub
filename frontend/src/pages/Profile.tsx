import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import InitialsAvatar from '../components/InitialsAvatar';
import { generateColor, getFirstLetter, getInitialsAvatar, isValidAvatarUrl } from '../utils/avatarUtils';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  role: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  category: string;
  upvotes: string[];
  downvotes: string[];
  comments: string[];
  views: number;
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, token } = useAuth() as { user: any; token: string };
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProfile = async () => {
      // If ID is undefined or invalid, redirect to home
      if (!id || id === 'undefined') {
        console.log('Invalid user ID, redirecting to home');
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(userResponse.data);
        
        // Fetch user's posts
        const postsResponse = await axios.get(`http://localhost:5000/api/posts/user/${id}`);
        setPosts(postsResponse.data);

        console.log('User data:', userResponse.data);
        console.log('Posts data:', postsResponse.data);
      } catch (err: any) {
        console.error('Profile error:', err.response?.data?.msg || err.message);
        setError('User not found or error loading profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, navigate]);
  
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !token) {
      setUpdateError('You must be logged in to update your profile');
      return;
    }
    
    try {
      setUpdateLoading(true);
      setUpdateError('');
      
      // Backend endpoint will need to be updated to support this call
      const response = await axios.put(
        `http://localhost:5000/api/users/${user?._id}`,
        editForm,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data);
      setShowEditModal(false);
      
    } catch (err: any) {
      console.error('Update error:', err.response?.data || err.message);
      setUpdateError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">User Not Found</h2>
          <p className="mt-2 text-gray-500">{error || 'The user you are looking for does not exist or has been removed.'}</p>
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
  
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalVotes = posts.reduce((sum, post) => sum + (post.upvotes.length - post.downvotes.length), 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-32"></div>
        <div className="px-6 py-4 relative">
          <div className="flex flex-col sm:flex-row">
            <div className="absolute -top-16 sm:relative sm:top-0">
              {isValidAvatarUrl(user?.avatar) ? (
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallbackEl = document.getElementById(`profile-avatar-fallback`);
                    if (fallbackEl) {
                      fallbackEl.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <InitialsAvatar 
                  username={user?.username || 'User'} 
                  size="128px"
                  className="border-4 border-white shadow-md"
                />
              )}
              <div 
                id="profile-avatar-fallback" 
                style={{display: 'none'}}
                className="h-32 w-32 rounded-full border-4 border-white shadow-md"
              >
                <InitialsAvatar 
                  username={user?.username || 'User'} 
                  size="128px"
                />
              </div>
            </div>
            
            <div className="mt-16 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                
                {currentUser && currentUser._id === user._id && (
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="mt-4 sm:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {joinDate}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Reputation: {user.reputation || 0}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {posts.length} Posts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Views</h3>
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Votes</h3>
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Comments</h3>
              <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'posts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'about'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            About
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'posts' ? (
            <React.Fragment>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {posts.length > 0 ? `${user.username}'s Posts (${posts.length})` : 'No posts yet'}
              </h2>
              
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5a2 2 0 00-2 2v12a2 2 0 002 2h5z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No posts yet</h3>
                  <p className="mt-2 text-gray-500">This user hasn't created any posts.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <Link to={`/post/${post._id}`} className="block">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2 mb-4">{post.content}</p>
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 space-x-6">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{post.upvotes.length - post.downvotes.length} votes</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments.length} comments</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {user.username}</h2>
              
              {user.bio ? (
                <p className="text-gray-700">{user.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio provided.</p>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-500">Username</dt>
                    <dd className="text-gray-900 font-medium">{user.username}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="text-gray-900 font-medium">{user.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-500">Member Since</dt>
                    <dd className="text-gray-900 font-medium">{joinDate}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-500">Role</dt>
                    <dd className="text-gray-900 font-medium">{user.role || 'Member'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Profile
                      </h3>
                      
                      {updateError && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {updateError}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={editForm.username}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                          Avatar URL
                        </label>
                        <input
                          type="text"
                          name="avatar"
                          id="avatar"
                          value={editForm.avatar}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Leave empty to use an automatically generated avatar with your initials.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          rows={4}
                          value={editForm.bio}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Tell us about yourself..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 