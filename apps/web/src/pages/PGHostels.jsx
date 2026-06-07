import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import SubcategoryButtons from '@/components/SubcategoryButtons';

const PGHostels = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = 'http://localhost:5000/api/listings?category=pg_rent';
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
        console.error('Error fetching PGs:', error);
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
        <title>PG & Hostels for Students in Dehradun - DoonProperties</title>
        <meta 
          name="description" 
          content="Best PG accommodations near Graphic Era University, UPES, and other colleges in Dehradun. Affordable rent with meals, WiFi, parking included. Safe and comfortable living for students and working professionals." 
        />
        <meta 
          name="keywords" 
          content="pg in dehradun, hostel in dehradun, student accommodation dehradun, pg near graphic era, pg near upes, paying guest dehradun, girls pg dehradun, boys pg dehradun, cheap pg in dehradun" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="PG & Hostels for Students in Dehradun" />
        <meta property="og:description" content="Best PG accommodations near Graphic Era, UPES. Affordable rent with meals, WiFi, parking. Safe and comfortable living." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">PG & Student Hostels in Dehradun</h1>
          <p className="text-gray-600 mb-4">Affordable paying guest accommodations near Graphic Era, UPES, and other colleges. Safe, comfortable, and budget-friendly options for students and working professionals.</p>
          
          <SubcategoryButtons 
            category="pg_rent"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
          
          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No PG/hostel listings available yet.</p>
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

export default PGHostels;