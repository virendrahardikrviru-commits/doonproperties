
import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const LocationMap = ({ coordinates, googleMapsLink }) => {
  if (!coordinates || coordinates.length !== 2) return null;

  const [lat, lon] = coordinates;
  
  // Using a generic iframe embed for Google Maps
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
  
  const handleOpenInMaps = () => {
    const url = googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-soft)] mt-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Map View</h2>
      </div>
      
      <div className="map-container group">
        <iframe
          title="Property Location Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          className="absolute inset-0 z-0"
        ></iframe>
        
        {/* Overlay to prevent scrolling issues on mobile until clicked, optional but good practice */}
        <div className="absolute inset-0 bg-transparent z-10 pointer-events-none"></div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleOpenInMaps}
          className="flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-primary/90 hover:shadow transition-all active:scale-95"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Open in Google Maps
          <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default LocationMap;
