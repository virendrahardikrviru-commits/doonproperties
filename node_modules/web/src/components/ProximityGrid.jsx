
import React from 'react';
import { formatDistance, formatTime, LANDMARKS } from '@/lib/locationUtils.js';
import { Car, Footprints } from 'lucide-react';

const ProximityGrid = ({ proximityData }) => {
  if (!proximityData) return null;

  const landmarksList = [
    { key: 'isbt', name: LANDMARKS.ISBT.name },
    { key: 'railway', name: LANDMARKS.RAILWAY.name },
    { key: 'upes', name: LANDMARKS.UPES.name },
    { key: 'clock_tower', name: LANDMARKS.CLOCK_TOWER.name }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-soft)]">
      <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">
        Location & Nearby Landmarks
      </h2>
      
      <div className="proximity-grid">
        {landmarksList.map((landmark) => {
          const distance = proximityData[`${landmark.key}_distance`];
          const drivingTime = proximityData[`${landmark.key}_driving_time`];
          const walkingTime = proximityData[`${landmark.key}_walking_time`];
          
          // If distance is less than 2km, show walking time, else driving time
          const isWalkable = distance < 2;
          
          return (
            <div key={landmark.key} className="proximity-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                {isWalkable ? <Footprints className="w-5 h-5" /> : <Car className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">{landmark.name}</h3>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {formatDistance(distance)} away
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                {isWalkable ? formatTime(walkingTime) : formatTime(drivingTime)} {isWalkable ? 'walk' : 'drive'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProximityGrid;
