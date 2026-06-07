import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const categories = [
    { name: 'Residential Buy', path: '/residential-buy' },
    { name: 'Residential Rent', path: '/residential-rent' },
    { name: 'PG & Hostels', path: '/pg-hostels' },
    { name: 'Commercial Rent', path: '/commercial-rent' },
    { name: 'Commercial Buy', path: '/commercial-buy' }
  ];

  const aboutSupport = [
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact Us', path: '/contact-us' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Help & Safety', path: '/help-safety' }
  ];

  const legal = [
    { name: 'Terms of Use', path: '/terms-of-use' },
    { name: 'Privacy Policy', path: '/privacy-policy' }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Support */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">About & Support</h3>
            <ul className="space-y-2">
              {aboutSupport.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-gray-500 text-sm">&copy; 2026 Doon Properties. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
