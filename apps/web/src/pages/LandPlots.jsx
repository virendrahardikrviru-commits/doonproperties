import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import SubcategoryButtons from '@/components/SubcategoryButtons';

const LandPlots = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let url = 'http://localhost:5000/api/listings?category=land_plot';
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
        console.error('Error fetching land/plots:', error);
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
        <title>Land & Plots for Sale in Dehradun - DoonProperties</title>
        <meta 
          name="description" 
          content="Buy residential and commercial land in Dehradun. Approved plots with clear titles, bank loan eligible. Best deals on land in prime locations like Rajpur Road, Clement Town, Vasant Vihar, and Sahastradhara Road." 
        />
        <meta 
          name="keywords" 
          content="land for sale in dehradun, plots in dehradun, residential land dehradun, commercial land dehradun, buy plot dehradun, agricultural land dehradun, approved plots dehradun, land bank loan eligible" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Land & Plots for Sale in Dehradun" />
        <meta property="og:description" content="Buy residential and commercial land in Dehradun. Approved plots, bank loan eligible. Best deals on land." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Land & Plots for Sale in Dehradun</h1>
          <p className="text-gray-600 mb-4">Find residential and commercial land in prime Dehradun locations. Approved plots with clear titles, bank loan eligible. Great investment opportunities.</p>
          
          <SubcategoryButtons 
            category="land_plot"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
          
          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No land/plot listings available yet.</p>
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

export default LandPlots;