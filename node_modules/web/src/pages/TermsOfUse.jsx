import React from 'react';
import { Helmet } from 'react-helmet';

const TermsOfUse = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Use - DoonProperties</title>
        <meta 
          name="description" 
          content="Read the terms and conditions for using DoonProperties platform. Learn about user responsibilities, prohibited activities, and legal guidelines." 
        />
        <meta 
          name="keywords" 
          content="terms of use, terms and conditions, doonproperties terms, property platform terms, legal guidelines" 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h1>
            <div className="space-y-4 text-gray-600">
              <p>Last updated: June 2026</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">1. Acceptance of Terms</h2>
              <p>By accessing DoonProperties, you agree to be bound by these Terms of Use.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">2. User Responsibilities</h2>
              <p>Users must provide accurate information when posting property listings. DoonProperties reserves the right to remove any content that violates these terms.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">3. Property Listings</h2>
              <p>All property information is provided by users. We verify but cannot guarantee the accuracy of every listing. Users should verify property details independently.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">4. Prohibited Activities</h2>
              <p>Posting fake listings, duplicate ads, or fraudulent content is strictly prohibited and may lead to account suspension.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">5. Modifications</h2>
              <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;