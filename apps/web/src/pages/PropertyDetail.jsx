import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, MapPin, Bed, Bath, Square, Home, Phone, Mail, MessageCircle, Flag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const PropertyDetail = () => {
  const { slugOrId } = useParams();  // ✅ Changed from propertyId to slugOrId
  const { isLoggedIn, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: `I am interested in this property. Please contact me.`
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        let response;
        let data;
        
        // ✅ First try to fetch by slug
        response = await fetch(`http://localhost:5000/api/listings/slug/${slugOrId}`);
        data = await response.json();
        
        // ✅ If slug fails, try by ID
        if (!data.success) {
          response = await fetch(`http://localhost:5000/api/listings/${slugOrId}`);
          data = await response.json();
        }
        
        if (data.success && data.data) {
          setProperty(data.data);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    if (slugOrId) fetchProperty();
    else setLoading(false);
  }, [slugOrId]);

  // Helper function to get contact phone - priority: contactPhone > seller_phone
  const getContactPhone = () => {
    if (property?.contactPhone) return property.contactPhone;
    if (property?.seller_phone) return property.seller_phone;
    return null;
  };

  // Helper function to get contact email
  const getContactEmail = () => {
    if (property?.seller_email) return property.seller_email;
    return null;
  };

  const getImages = () => {
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    if (property?.image) return [property.image];
    return ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'];
  };

  const images = getImages();

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); };
  const prevImage = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please sign in to contact the seller');
      return;
    }

    if (!/^\d{10}$/.test(inquiryForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // ✅ Use property.id for inquiry (not slug)
      const listingId = property?.id;
      if (!listingId) {
        toast.error('Property not found');
        return;
      }

      const requestBody = {
        listingId: parseInt(listingId),
        buyerName: inquiryForm.name,
        buyerEmail: inquiryForm.email,
        buyerPhone: inquiryForm.phone,
        message: inquiryForm.message
      };
      
      console.log('Sending inquiry:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      console.log('Inquiry result:', result);
      
      if (result.success) {
        toast.success('Inquiry sent successfully! The seller will contact you soon.');
        setInquiryForm({ 
          ...inquiryForm, 
          phone: '', 
          message: `I am interested in this property. Please contact me.` 
        });
      } else {
        toast.error(result.message || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send inquiry. Please try again.');
    }
  };

  const formatPrice = () => {
    const priceNum = typeof property?.price === 'string' ? parseInt(property.price.replace(/,/g, '')) : property?.price;
    const formatted = `₹${priceNum?.toLocaleString('en-IN')}`;
    if (property?.category === 'residential_rent' || property?.category === 'commercial_rent' || property?.category === 'pg_rent') {
      return `${formatted}/month`;
    }
    return formatted;
  };

  const renderCategoryDetails = () => {
    if (!property) return null;
    
    if (property.category === 'land_plot') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div><strong className="text-gray-700">Plot Area:</strong> <span className="text-gray-600">{property.built_up_area || property.super_builtup_area || property.builtUpArea || property.superBuiltupArea || 'N/A'} sqft/sqyd</span></div>
          <div><strong className="text-gray-700">Land Type:</strong> <span className="text-gray-600">{property.landType || property.property_type || property.propertyType || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Facing:</strong> <span className="text-gray-600">{property.facing_direction || property.facing || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Approved By:</strong> <span className="text-gray-600">{property.approvedBy || property.project_name || property.projectName || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Status:</strong> <span className="text-gray-600">{property.status || 'Available'}</span></div>
          <div><strong className="text-gray-700">Listed By:</strong> <span className="text-gray-600">{property.seller_type || property.sellerType || 'Owner'}</span></div>
        </div>
      );
    }
    
    if (property.category === 'residential_sale' || property.category === 'residential_rent') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div><strong className="text-gray-700">Property Type:</strong> <span className="text-gray-600">{property.property_type || property.propertyType || 'N/A'}</span></div>
          <div><strong className="text-gray-700">BHK:</strong> <span className="text-gray-600">{property.bhk || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Bathrooms:</strong> <span className="text-gray-600">{property.bathrooms || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Furnishing:</strong> <span className="text-gray-600">{property.furnishing || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Super Builtup Area:</strong> <span className="text-gray-600">{property.super_builtup_area || property.superBuiltupArea || 'N/A'} sqft</span></div>
          <div><strong className="text-gray-700">Carpet Area:</strong> <span className="text-gray-600">{property.carpet_area || property.carpetArea || 'N/A'} sqft</span></div>
          <div><strong className="text-gray-700">Facing:</strong> <span className="text-gray-600">{property.facing_direction || property.facing || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Status:</strong> <span className="text-gray-600">{property.status || 'Ready to Move'}</span></div>
          <div><strong className="text-gray-700">Car Parking:</strong> <span className="text-gray-600">{property.car_parking || property.carParking || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Maintenance:</strong> <span className="text-gray-600">{property.maintenance ? `₹${property.maintenance}/month` : 'N/A'}</span></div>
          <div><strong className="text-gray-700">Project Name:</strong> <span className="text-gray-600">{property.project_name || property.projectName || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Total Floors:</strong> <span className="text-gray-600">{property.total_floors || property.totalFloors || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Floor No:</strong> <span className="text-gray-600">{property.floor_no || property.floorNo || 'N/A'}</span></div>
        </div>
      );
    }
    
    if (property.category === 'pg_rent') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div><strong className="text-gray-700">Room Type:</strong> <span className="text-gray-600">{property.room_type || property.roomType || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Meals Included:</strong> <span className="text-gray-600">{property.meals_included || property.mealsIncluded ? 'Yes' : 'No'}</span></div>
          <div><strong className="text-gray-700">Car Parking:</strong> <span className="text-gray-600">{property.car_parking || property.carParking || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Listed By:</strong> <span className="text-gray-600">{property.seller_type || property.sellerType || 'Owner'}</span></div>
        </div>
      );
    }
    
    if (property.category === 'commercial_sale' || property.category === 'commercial_rent') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div><strong className="text-gray-700">Space Type:</strong> <span className="text-gray-600">{property.space_type || property.spaceType || property.property_type || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Furnishing:</strong> <span className="text-gray-600">{property.furnishing || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Washrooms:</strong> <span className="text-gray-600">{property.washrooms || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Area:</strong> <span className="text-gray-600">{property.super_builtup_area || property.superBuiltupArea || property.built_up_area || 'N/A'} sqft</span></div>
          <div><strong className="text-gray-700">Car Parking:</strong> <span className="text-gray-600">{property.car_parking || property.carParking || 'N/A'}</span></div>
          <div><strong className="text-gray-700">Listed By:</strong> <span className="text-gray-600">{property.seller_type || property.sellerType || 'Owner'}</span></div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-8">The property you are looking for does not exist or has been removed.</p>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Dynamic Title Tag for SEO */}
      <Helmet>
        <title>{property.title} - Dehradun Estates</title>
        <meta name="description" content={property.description?.substring(0, 160)} />
        <meta property="og:title" content={`${property.title} - Dehradun Estates`} />
        <meta property="og:description" content={property.description?.substring(0, 160)} />
        <meta property="og:image" content={images[0]} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
            <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10" onClick={closeLightbox}>×</button>
            {images.length > 1 && (
              <>
                <button className="absolute left-4 text-white text-5xl hover:text-gray-300 z-10" onClick={prevImage}>‹</button>
                <button className="absolute right-4 text-white text-5xl hover:text-gray-300 z-10" onClick={nextImage}>›</button>
              </>
            )}
            <img src={images[currentImageIndex]} alt="Property" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200 flex items-center justify-center cursor-pointer" onClick={() => openLightbox(0)}>
                  <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {images.slice(1, 5).map((img, idx) => (
                      <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80" onClick={() => openLightbox(idx + 1)}>
                        <img src={img} alt={`${property.title} - ${idx + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{formatPrice()}</div>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 my-4">
                  {property.bhk && (
                    <div className="text-center">
                      <Home className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <div className="font-semibold">{property.bhk} BHK</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <div className="font-semibold">{property.bathrooms} Bathrooms</div>
                    </div>
                  )}
                  {(property.super_builtup_area || property.superBuiltupArea) && (
                    <div className="text-center">
                      <Square className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <div className="font-semibold">{property.super_builtup_area || property.superBuiltupArea} sqft</div>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="text-center">
                      <Bed className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                      <div className="font-semibold">{property.furnishing}</div>
                    </div>
                  )}
                  {property.category === 'land_plot' && (
                    <>
                      <div className="text-center">
                        <Square className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                        <div className="font-semibold">{property.built_up_area || property.super_builtup_area || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Plot Area</div>
                      </div>
                      <div className="text-center">
                        <div className="w-5 h-5 mx-auto mb-1 text-gray-500">🏷️</div>
                        <div className="font-semibold">{property.landType || property.property_type || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Land Type</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
                </div>

                {/* Category-Specific Details */}
                {renderCategoryDetails()}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{amenity}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Contact Form and Seller Info */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Contact Seller</h3>
                {!isLoggedIn ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Sign in to contact seller</p>
                    <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">Sign In</Link>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={inquiryForm.name} 
                      onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})} 
                      className="w-full border rounded-lg p-2" 
                      required 
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      value={inquiryForm.email} 
                      onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})} 
                      className="w-full border rounded-lg p-2" 
                      required 
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number (10 digits)" 
                      value={inquiryForm.phone} 
                      onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})} 
                      className="w-full border rounded-lg p-2" 
                      required 
                    />
                    <textarea 
                      rows="4" 
                      placeholder="Your Message" 
                      value={inquiryForm.message} 
                      onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} 
                      className="w-full border rounded-lg p-2"
                    ></textarea>
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Send Inquiry
                    </button>
                  </form>
                )}
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Listed By</h3>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    {property.seller_type === 'Owner' || property.sellerType === 'Owner' ? 'O' : 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{property.seller_type || property.sellerType || 'Owner'}</p>
                    <p className="text-sm text-gray-500">Posted on: {new Date(property.created_at || property.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Seller Contact Details - Only visible to logged in users */}
              {isLoggedIn && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4">Contact Details</h3>
                  <div className="space-y-3">
                    {getContactPhone() && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`tel:${getContactPhone()}`} 
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {getContactPhone()}
                        </a>
                      </div>
                    )}
                    {getContactEmail() && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`mailto:${getContactEmail()}`} 
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {getContactEmail()}
                        </a>
                      </div>
                    )}
                    {!getContactPhone() && !getContactEmail() && (
                      <p className="text-gray-500 text-sm">Contact information not available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Contact the seller directly for more information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetail;