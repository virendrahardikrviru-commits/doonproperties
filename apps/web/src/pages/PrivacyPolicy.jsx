import React from 'react';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - DoonProperties</title>
        <meta 
          name="description" 
          content="Learn how DoonProperties collects, uses, and protects your personal information. Read our privacy policy for complete transparency." 
        />
        <meta 
          name="keywords" 
          content="privacy policy, data protection, personal information, doonproperties privacy, user data security" 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="space-y-4 text-gray-600">
              <p>Last updated: June 2026</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Information We Collect</h2>
              <p>We collect information you provide directly to us, such as your name, email address, phone number, and property details when you create an account or post a listing.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">How We Use Your Information</h2>
              <p>We use your information to provide, maintain, and improve our services, to communicate with you, and to facilitate property transactions.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Information Sharing</h2>
              <p>We do not sell your personal information to third parties. Your contact information is only shared with other users when you initiate contact through our platform.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Google Authentication</h2>
              <p>We use Google OAuth for authentication. Google's privacy policy governs the data shared during authentication.</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@doonproperties.com.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;