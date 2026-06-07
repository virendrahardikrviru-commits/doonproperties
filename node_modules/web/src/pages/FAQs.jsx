import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button className="flex justify-between items-center w-full text-left" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-semibold text-gray-900">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <p className="text-gray-600 mt-2">{answer}</p>}
    </div>
  );
};

const FAQs = () => {
  const faqs = [
    { q: "How do I post a property ad?", a: "Login with Google or email, click on 'Post Ad' button, fill in the property details, upload photos, and submit. Your ad will be live instantly." },
    { q: "Is it free to list my property?", a: "Yes, posting property ads is completely free on DoonProperties." },
    { q: "How can I contact a seller?", a: "View the property detail page and use the contact form or chat with seller option after logging in." },
    { q: "How do I save favorite properties?", a: "Click the heart icon on any property card after logging in to save it to your favorites." },
    { q: "Can I edit or delete my listing?", a: "Yes, go to your Dashboard → My Listings, and you can edit or delete your posted properties." },
    { q: "How do I report a listing?", a: "On the property detail page, click the 'Report Listing' button and select a reason." },
    { q: "Is my personal information secure?", a: "Yes, we take data security seriously. Your contact details are only shared with sellers when you initiate contact." },
    { q: "How long does it take for my ad to appear?", a: "Your ad appears immediately after submission. No approval required for standard listings." }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - DoonProperties</title>
        <meta 
          name="description" 
          content="Find answers to common questions about property listing, buying, renting process on DoonProperties. Learn how to post ads, contact sellers, save favorites, and more." 
        />
        <meta 
          name="keywords" 
          content="faqs, property questions, how to post ad, contact seller, save favorites, property help, doonproperties faq" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Frequently Asked Questions - DoonProperties" />
        <meta property="og:description" content="Find answers to common questions about property listing, buying, renting process." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h1>
            <div>{faqs.map((faq, idx) => (<FAQItem key={idx} question={faq.q} answer={faq.a} />))}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;