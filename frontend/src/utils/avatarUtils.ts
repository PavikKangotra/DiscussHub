/**
 * Utility functions for avatar generation and display
 */

/**
 * Safely gets the first letter of a name for avatar display
 * @param name The username or name string
 * @returns The uppercase first letter, or 'U' as fallback
 */
export const getFirstLetter = (name?: string): string => {
  if (!name || typeof name !== 'string' || name.length === 0) {
    console.log("Invalid username for avatar:", name);
    return 'U';
  }
  
  // Ensure we're working with a clean string
  const cleanName = name.trim();
  if (cleanName.length === 0) return 'U';
  
  // Get the first character and convert to uppercase
  return cleanName.charAt(0).toUpperCase();
};

/**
 * Creates a unique identifier for anonymous users based on a provided ID or random string
 * @param id Some identifier to base the anonymous name on (e.g., a user ID or post ID)
 * @returns A consistent string like "User ABC"
 */
export const createUniqueIdentifier = (id?: string): string => {
  if (!id) {
    // Generate a random 3-character string if no ID is provided
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `User ${result}`;
  }
  
  // Take the last 3-5 characters of the ID to create a unique suffix
  const suffix = id.slice(-Math.min(5, id.length)).toUpperCase();
  return `User ${suffix}`;
};

/**
 * Generates a deterministic color based on a username
 * @param username The username string
 * @returns A hex color code
 */
export const generateColor = (username: string = ''): string => {
  const colors = [
    '#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', 
    '#818CF8', '#A78BFA', '#F472B6', '#F9A8D4'
  ];
  
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;
  return colors[colorIndex];
};

/**
 * Determines if an avatar URL is valid and usable
 * @param url The avatar URL to check
 * @returns Boolean indicating if the URL is valid for display
 */
export const isValidAvatarUrl = (url?: string): boolean => {
  if (!url) return false;
  if (url === 'default-avatar.png') return false;
  if (url.includes('undefined')) return false;
  if (url.startsWith('data:image/svg+xml')) return true; // SVG data URLs are valid
  return true;
};

/**
 * Generates an SVG data URL for an avatar with initials
 * @param username The username to display initials for
 * @returns A data URL string with the SVG avatar
 */
export const getInitialsAvatar = (username?: string): string => {
  // Handle undefined or null username
  if (!username || typeof username !== 'string' || username.length === 0) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23CBD5E1"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="35" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="white"%3EU%3C/text%3E%3C/svg%3E';
  }

  // Get the first letter of the username
  const initial = getFirstLetter(username);
  
  // Generate a deterministic color based on username
  const backgroundColor = generateColor(username);
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${backgroundColor.replace('#', '%23')}'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='35' font-weight='bold' text-anchor="middle" dominant-baseline="central" fill='white'%3E${initial}%3C/text%3E%3C/svg%3E`;
};

/**
 * Creates an event to trigger avatar refresh across components
 */
export const refreshUserAvatar = () => {
  // Create and dispatch a custom event to notify components of avatar changes
  const refreshEvent = new CustomEvent('user-avatar-refresh');
  window.dispatchEvent(refreshEvent);
  console.log("Avatar refresh event dispatched");
};

/**
 * Verifies and fixes a user object for avatar display
 * @param user The user object to verify
 * @returns A verified user object with necessary fields
 */
export const verifyUser = (user: any): any => {
  if (!user) {
    console.warn('verifyUser: No user provided');
    return { username: 'User' };
  }
  
  // Clone to avoid modifying the original
  const verifiedUser = { ...user };
  
  // Check for username
  if (!verifiedUser.username) {
    console.warn('verifyUser: Username missing, adding default');
    verifiedUser.username = 'User';
  } else {
    // Ensure first letter is capitalized if it's not already
    verifiedUser.username = verifiedUser.username.charAt(0).toUpperCase() + 
                            verifiedUser.username.slice(1);
  }
  
  // Check if avatar is valid
  if (verifiedUser.avatar) {
    if (verifiedUser.avatar === 'default-avatar.png' || verifiedUser.avatar.includes('undefined')) {
      console.warn('verifyUser: Invalid avatar URL detected, removing');
      delete verifiedUser.avatar;
    }
  }
  
  console.log('verifyUser: Verified user data:', verifiedUser);
  return verifiedUser;
}; 