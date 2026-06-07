import React from 'react';
import { Helmet } from 'react-helmet';

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About DoonProperties - Dehradun's Trusted Property Platform</title>
        <meta 
          name="description" 
          content="DoonProperties is Dehradun's leading real estate platform connecting buyers, sellers, and renters. Learn about our mission, values, and commitment to transparent property transactions." 
        />
        <meta 
          name="keywords" 
          content="about doonproperties, property platform dehradun, real estate dehradun, best property site dehradun, property dealer dehradun" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="About DoonProperties - Dehradun's Trusted Property Platform" />
        <meta property="og:description" content="Learn about DoonProperties - Dehradun's leading real estate platform." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">About DoonProperties</h1>
            <p className="text-gray-600 mb-6">Your trusted partner in finding the perfect property in Dehradun.</p>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
                <p className="text-gray-600">To provide a transparent, reliable, and easy-to-use platform for property seekers and sellers in Dehradun.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Verified property listings</li>
                  <li>Direct owner/agent contact</li>
                  <li>Real-time chat with sellers</li>
                  <li>Location-based property search</li>
                  <li>Detailed property insights</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Why Choose Us?</h2>
                <p className="text-gray-600">DoonProperties connects you with genuine property options across prime localities like Rajpur Road, Clement Town, Vasant Vihar, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;