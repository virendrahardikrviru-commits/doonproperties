import React from 'react';
import { Helmet } from 'react-helmet';
import { Shield, AlertTriangle, Eye, Lock, FileText, Users } from 'lucide-react';

const HelpSafety = () => {
  return (
    <>
      <Helmet>
        <title>Help & Safety Guidelines - DoonProperties</title>
        <meta 
          name="description" 
          content="Stay safe while buying, selling, or renting properties in Dehradun. Learn how to identify genuine listings, avoid fraud, and report suspicious activities on DoonProperties." 
        />
        <meta 
          name="keywords" 
          content="property safety tips, avoid fraud, genuine property listing, safe property dealing, real estate safety, doonproperties safety" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Help & Safety Guidelines - DoonProperties" />
        <meta property="og:description" content="Stay safe while buying, selling, or renting properties. Learn how to avoid fraud." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Help & Safety Guidelines</h1>
            
            <div className="space-y-8 mt-6">
              <div className="flex items-start gap-4"><Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Stay Safe</h2><p className="text-gray-600">Never share your OTP, bank details, or pay any advance fee before seeing the property. Always verify the property in person.</p></div></div>
              <div className="flex items-start gap-4"><AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Report Suspicious Listings</h2><p className="text-gray-600">If you find a listing that seems fraudulent, use the 'Report' button to alert our team immediately.</p></div></div>
              <div className="flex items-start gap-4"><Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Verify Before You Trust</h2><p className="text-gray-600">Look for verified owner/badge on listings. Chat with sellers through our platform for secure communication.</p></div></div>
              <div className="flex items-start gap-4"><Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Protect Your Privacy</h2><p className="text-gray-600">Your contact details are only shared with sellers after you initiate an inquiry or chat.</p></div></div>
              <div className="flex items-start gap-4"><FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Document Verification</h2><p className="text-gray-600">Ask for property documents, title deeds, and approvals before making any payment.</p></div></div>
              <div className="flex items-start gap-4"><Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h2 className="font-semibold text-lg">Meet in Person</h2><p className="text-gray-600">Always meet the seller/agent in person and visit the property before making any transaction.</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpSafety;