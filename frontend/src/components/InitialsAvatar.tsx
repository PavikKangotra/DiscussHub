import React, { useEffect, useState } from 'react';
import { generateColor, getFirstLetter } from '../utils/avatarUtils';

interface InitialsAvatarProps {
  username: string;
  size?: string | number;
  className?: string;
  textColor?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  forceInitials?: boolean; // New prop to force using initials even if avatar exists
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  username,
  size = '40px',
  className = '',
  textColor = 'white',
  fontSize,
  fontWeight = 'bold',
  forceInitials = false
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);

  // Listen for avatar refresh events
  useEffect(() => {
    const handleAvatarRefresh = () => {
      console.log("Avatar refresh event received in InitialsAvatar for", username);
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('user-avatar-refresh', handleAvatarRefresh);
    
    return () => {
      window.removeEventListener('user-avatar-refresh', handleAvatarRefresh);
    };
  }, [username]);

  // Get the first letter of the username - do this first to ensure it's always defined
  const initial = getFirstLetter(username);
  
  useEffect(() => {
    console.log('InitialsAvatar rendering for username:', username, 'initial:', initial, 'force update:', forceUpdate);
  }, [username, initial, forceUpdate]);

  // Handle undefined, null or empty username
  if (!username || username.trim() === '') {
    console.log('Username is empty or undefined, showing default avatar');
    return (
      <div 
        className={`initials-avatar ${className}`} 
        style={{ 
          width: size, 
          height: size,
          backgroundColor: '#CBD5E1',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontSize: fontSize || `calc(${typeof size === 'number' ? size + 'px' : size} / 2)`,
          fontWeight
        }}
      >
        U
      </div>
    );
  }
  
  // Generate a deterministic color based on username
  const backgroundColor = generateColor(username);
  
  // Calculate fontSize if not provided
  const calculatedFontSize = fontSize || `calc(${typeof size === 'number' ? size + 'px' : size} / 2)`;

  return (
    <div 
      className={`initials-avatar ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        fontSize: calculatedFontSize,
        fontWeight,
        textTransform: 'uppercase',
        overflow: 'hidden'
      }}
    >
      {initial}
    </div>
  );
};

export default InitialsAvatar; 