import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import InitialsAvatar from '../components/InitialsAvatar';
import { isValidAvatarUrl } from '../utils/avatarUtils';

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

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users');
        console.log('Users fetched:', response.data);
        setUsers(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>
      
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map(user => (
            <div key={user._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
              <Link to={`/profile/${user._id}`} className="p-6 flex flex-col items-center">
                {isValidAvatarUrl(user.avatar) ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-20 h-20 rounded-full object-cover mb-4"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallbackEl = document.getElementById(`avatar-fallback-${user._id}`);
                      if (fallbackEl) {
                        fallbackEl.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <InitialsAvatar 
                    username={user.username} 
                    size="80px"
                    className="mb-4"
                  />
                )}
                <div id={`avatar-fallback-${user._id}`} style={{display: 'none'}}>
                  <InitialsAvatar 
                    username={user.username} 
                    size="80px"
                    className="mb-4"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.role}</p>
                <div className="mt-2 flex items-center">
                  <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-500">{user.reputation}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users; 