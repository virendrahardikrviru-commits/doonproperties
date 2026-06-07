import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import EditListingModal from './EditListingModal';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/listings/user/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setListings(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Listing deleted successfully');
        fetchListings();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const handleEdit = (listing, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingListing(listing);
    setIsEditModalOpen(true);
  };

  const handleUpdateComplete = () => {
    fetchListings(); // Refresh the list after update
  };

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getImageUrl = (listing) => {
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images[0];
    }
    if (listing.image) return listing.image;
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';
  };

  const getPriceUnit = (category) => {
    if (category === 'residential_rent' || category === 'commercial_rent' || category === 'pg_rent') {
      return '/month';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading your listings...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You haven't posted any listings yet.</p>
        <Link to="/" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Post Your First Ad
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative group">
            {/* Edit and Delete Buttons - Top Right */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(listing, e)}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={(e) => handleDelete(listing.id, e)}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <Link to={`/property/${listing.id}`}>
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img 
                  src={getImageUrl(listing)} 
                  alt={listing.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
              <div className="p-4">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {formatPrice(listing.price)}{getPriceUnit(listing.category)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
                {(listing.bhk || listing.bathrooms || listing.furnishing) && (
                  <div className="text-sm text-gray-600 mt-2">
                    {listing.bhk && <span className="mr-3">{listing.bhk} BHK</span>}
                    {listing.bathrooms && <span className="mr-3">{listing.bathrooms} Bath</span>}
                    {listing.furnishing && <span>{listing.furnishing}</span>}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingListing(null);
        }}
        listing={editingListing}
        onUpdate={handleUpdateComplete}
      />
    </>
  );
};

export default MyListings;