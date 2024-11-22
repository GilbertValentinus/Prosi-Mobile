// header-navigasi.jsx
import React from 'react';
import { ArrowLeft, Navigation2 } from 'lucide-react';

const Header = ({ 
  navigate, 
  loading, 
  userLocation, 
  destinationName, 
  error, 
  routeInfo, 
  currentMode, 
  setMode,
  modeConfigs 
}) => (
  <div className="absolute top-0 left-0 right-0 z-20 bg-[#222745] text-white p-4 rounded-b-[15px] shadow-md">
    <div className="flex items-center gap-4">
      <button onClick={() => navigate(-1)} className="p-2">
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1">
        <p className="text-sm opacity-70">Your location</p>
        <p className="font-semibold truncate">
          {loading ? 'Loading...' : userLocation ? 'Current Location' : 'Location not available'}
        </p>
      </div>
    </div>

    <div className="mt-2 flex items-center gap-4">
      <Navigation2 size={24} className="opacity-70" />
      <div className="flex-1">
        <p className="font-semibold truncate">{destinationName}</p>
      </div>
    </div>

    {error && (
      <div className="mt-2 bg-red-500 text-white p-2 rounded-lg">
        {error}
      </div>
    )}

    {routeInfo && !error && (
      <div className="flex gap-4 mt-4 bg-[#2A2F4E] p-2 rounded-lg">
        <div className="flex-1 text-center p-2">
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
            {modeConfigs[currentMode].icon} {routeInfo.duration} min
          </span>
        </div>
        <div className="flex-1 text-center p-2">
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
            📍 {routeInfo.distance} km
          </span>
        </div>
      </div>
    )}

    {/* Transportation Modes */}
    <div className="flex justify-center gap-4 mt-4">
      {Object.entries(modeConfigs).map(([modeName, config]) => (
        <button
          key={modeName}
          onClick={() => setMode(modeName)}
          className={`px-4 py-2 rounded-full ${
            modeName === currentMode 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {config.icon}
        </button>
      ))}
    </div>
  </div>
);

export default Header;