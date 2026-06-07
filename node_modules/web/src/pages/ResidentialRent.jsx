import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import SubcategoryButtons from '@/components/SubcategoryButtons';

const ResidentialRent = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = 'http://localhost:5000/api/listings?category=residential_rent';
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
        <title>Residential Properties for Rent in Dehradun - DoonProperties</title>
        <meta 
          name="description" 
          content="Find rental homes, apartments, and houses in Dehradun. Affordable rent in prime locations like Rajpur Road, Clement Town, Vasant Vihar. Contact owners directly. Best deals on rental properties." 
        />
        <meta 
          name="keywords" 
          content="house for rent in dehradun, flat for rent dehradun, rental property dehradun, 2 bhk flat rent dehradun, 3 bhk house rent dehradun, affordable rent dehradun, property on rent dehradun" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Residential Properties for Rent in Dehradun" />
        <meta property="og:description" content="Find rental homes and apartments in Dehradun. Affordable rates, prime locations. Contact owners directly." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Residential Properties for Rent in Dehradun</h1>
          <p className="text-gray-600 mb-4">Find rental homes, apartments, and houses in prime Dehradun locations. Affordable rates, verified listings.</p>
          
          {/* Subcategory Buttons */}
          <SubcategoryButtons 
            category="residential_rent"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
          
          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No rental properties listed yet.</p>
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

export default ResidentialRent;