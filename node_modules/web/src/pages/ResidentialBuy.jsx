import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import SubcategoryButtons from '@/components/SubcategoryButtons';

const ResidentialBuy = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = 'http://localhost:5000/api/listings?category=residential_sale';
        if (selectedSubcategory) {
          url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data) {
          setProperties(data.data);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [selectedSubcategory]);

  return (
    <>
      <Helmet>
        <title>Residential Properties for Sale in Dehradun - DoonProperties</title>
        <meta 
          name="description" 
          content="Buy flats, houses, villas in Dehradun. Explore 1/2/3/4 BHK properties at Rajpur Road, Clement Town, Vasant Vihar. Verified listings, direct owner contact. Best deals on residential properties." 
        />
        <meta 
          name="keywords" 
          content="house for sale in dehradun, flat for sale dehradun, buy property dehradun, residential property dehradun, 3 bhk flat dehradun, villa for sale dehradun, property in dehradun" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Residential Properties for Sale in Dehradun" />
        <meta property="og:description" content="Find your dream home in Dehradun. Buy flats, houses, villas at best prices." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back to Home Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Residential Properties for Sale in Dehradun</h1>
          <p className="text-gray-600 mb-4">Find your dream home — flats, apartments, villas, and independent houses across prime Dehradun locations.</p>
          
          {/* Subcategory Buttons */}
          <SubcategoryButtons 
            category="residential_sale"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
          
          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No residential properties listed for sale yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResidentialBuy;