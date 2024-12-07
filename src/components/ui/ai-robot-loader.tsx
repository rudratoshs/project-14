'use client'

import React from 'react'

interface AIRobotLoaderProps {
  size?: 'small' | 'medium' | 'large'
  primaryColor?: string
  secondaryColor?: string
}

const AIRobotLoader: React.FC<AIRobotLoaderProps> = ({
  size = 'medium',
  primaryColor = '#10B981',
  secondaryColor = '#059669',
}) => {
  const dimensions = {
    small: 'w-32 h-16',
    medium: 'w-64 h-64',
    large: 'w-96 h-96',
  }

  return (
    <div className={`relative ${dimensions[size]}`}>
      <svg
        className="absolute inset-0"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot Head */}
        <rect x="35" y="20" width="30" height="25" rx="2" fill={primaryColor} className="animate-pulse" />
        
        {/* Robot Eyes */}
        <circle cx="45" cy="30" r="3" fill={secondaryColor} className="animate-blink" />
        <circle cx="55" cy="30" r="3" fill={secondaryColor} className="animate-blink" />
        
        {/* Robot Antenna */}
        <line x1="50" y1="20" x2="50" y2="10" stroke={primaryColor} strokeWidth="2" className="animate-pulse" />
        <circle cx="50" cy="8" r="3" fill={primaryColor} className="animate-ping" />
        
        {/* Robot Body */}
        <rect x="30" y="45" width="40" height="35" rx="2" fill={primaryColor} className="animate-pulse" />
        
        {/* Robot Arms */}
        <line x1="30" y1="55" x2="20" y2="65" stroke={primaryColor} strokeWidth="4" className="animate-wave" />
        <line x1="70" y1="55" x2="80" y2="65" stroke={primaryColor} strokeWidth="4" className="animate-wave-reverse" />
        
        {/* Robot Legs */}
        <line x1="40" y1="80" x2="40" y2="95" stroke={primaryColor} strokeWidth="4" />
        <line x1="60" y1="80" x2="60" y2="95" stroke={primaryColor} strokeWidth="4" />
        
        {/* Loading Text */}
        <text x="50" y="115" textAnchor="middle" fill={primaryColor} fontSize="8" className="animate-pulse">
          Loading AI...
        </text>
      </svg>
    </div>
  )
}

export default AIRobotLoader

