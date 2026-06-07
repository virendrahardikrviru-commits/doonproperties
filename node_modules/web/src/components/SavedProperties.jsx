
import React from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useFilter } from '@/contexts/FilterContext.jsx';
import PropertyCard from './PropertyCard.jsx';
import { HeartOff } from 'lucide-react';

const SavedProperties = () => {
  const { favorites } = useAuth();
  const { propertiesList } = useFilter();

  const savedListings = propertiesList.filter(p => favorites.includes(p.id));

  if (savedListings.length === 0) {
    return (
      <div className="bg-card border border-border border-dashed rounded-2xl py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <HeartOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No saved properties</h3>
        <p className="text-muted-foreground max-w-md">
          You haven't saved any properties yet. Click the heart icon on property cards to save them for later.
        </p>
      </div>
    );
  }

  return (
    <div className="property-grid">
      {savedListings.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default SavedProperties;
