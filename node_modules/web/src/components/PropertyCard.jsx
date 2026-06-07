import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PropertyCard = ({ property }) => {
  const { toggleFavorite, favorites } = useAuth();
  const isFavorited = favorites.includes(property.id);

  // Get image URL safely
  const getImageUrl = () => {
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image && typeof property.image === 'string') {
      return property.image;
    }
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';
  };

  // Format price based on category
  const formatPrice = () => {
    const priceNum = typeof property.price === 'string' ? parseInt(property.price.replace(/,/g, '')) : property.price;
    const formattedPrice = `₹${priceNum.toLocaleString('en-IN')}`;
    if (property.category === 'residential_rent' || property.category === 'commercial_rent' || property.category === 'pg_rent') {
      return `${formattedPrice}/month`;
    }
    return formattedPrice;
  };

  // ✅ Use slug if available, otherwise fallback to id
  const getPropertyLink = () => {
    if (property.slug) {
      return `/property/${property.slug}`;
    }
    return `/property/${property.id}`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <Link to={getPropertyLink()}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={getImageUrl()} 
            alt={property.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';
            }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-xl font-bold text-blue-600 mb-1">
            {formatPrice()}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
          {property.bhk && (
            <div className="text-sm text-gray-600 mt-1">
              {property.bhk} BHK • {property.bathrooms || 1} Bath
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;