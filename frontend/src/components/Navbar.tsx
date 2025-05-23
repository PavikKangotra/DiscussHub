import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { generateColor, getFirstLetter, getInitialsAvatar, verifyUser } from '../utils/avatarUtils';
import InitialsAvatar from './InitialsAvatar';

const Navbar: React.FC = () => {
  const { user: rawUser, logout } = useAuth() as { user: any; logout: any; loading: boolean; login: any; register: any; updateUser: any };
  const [isOpen, setIsOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();
  
  // Verify user object
  const user = rawUser ? verifyUser(rawUser) : null;

  // Force re-render when user or forceUpdate changes
  useEffect(() => {
    // Add event listener for avatar refresh
    const handleAvatarRefresh = () => {
      console.log("Avatar refresh event received in Navbar");
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('user-avatar-refresh', handleAvatarRefresh);
    
    return () => {
      window.removeEventListener('user-avatar-refresh', handleAvatarRefresh);
    };
  }, []);

  // Debug the user object
  useEffect(() => {
    console.log("Navbar user data:", user, "Force update:", forceUpdate);
    if (user) {
      if (user.username) {
        console.log("Username: ", user.username);
        console.log("First letter: ", getFirstLetter(user.username));
      } else {
        console.log("No username available in user data");
      }
    }
  }, [user, forceUpdate]);

  // Handle logout
  const handleLogout = () => {
    logout();
    // After logout, navigate to home page
    navigate('/');
    // Close mobile menu if open
    setIsOpen(false);
  };

  // Ensure we have a valid username to display
  const displayName = user?.username || 'User';
  const displayLetter = user?.username ? getFirstLetter(user.username) : 'U';
  
  // Check if the avatar URL is valid
  const hasValidAvatar = user?.avatar && user.avatar !== 'default-avatar.png' && !user.avatar.includes('undefined');

  // Check if user is valid and has an ID
  const hasValidUserId = !!user?._id;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">DiscussHub</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/users" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Users
            </Link>
            {hasValidUserId ? (
              <React.Fragment>
                <Link to="/create-post" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Create Post
                </Link>
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    {hasValidAvatar ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.avatar}
                        alt={displayName}
                        onError={(e) => {
                          console.error("Avatar image failed to load, falling back to initials");
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          // Force update to render initials avatar instead
                          setForceUpdate(prev => prev + 1);
                        }}
                      />
                    ) : (
                      <InitialsAvatar 
                        username={displayName} 
                        size="32px"
                      />
                    )}
                    <span className="text-sm font-medium">{displayName}</span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={`/profile/${user._id}`}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                  Register
                </Link>
              </React.Fragment>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/users"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Users
            </Link>
            {hasValidUserId ? (
              <React.Fragment>
                <Link
                  to="/create-post"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Create Post
                </Link>
                <Link
                  to={`/profile/${user._id}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center"
                >
                  <div className="mr-2">
                    {hasValidAvatar ? (
                      <img
                        className="h-6 w-6 rounded-full object-cover"
                        src={user.avatar}
                        alt={displayName}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          setForceUpdate(prev => prev + 1);
                        }}
                      />
                    ) : (
                      <InitialsAvatar 
                        username={displayName} 
                        size="24px"
                      />
                    )}
                  </div>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Register
                </Link>
              </React.Fragment>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 