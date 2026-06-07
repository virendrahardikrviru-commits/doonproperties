import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ContactUs = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ ...formData, subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact DoonProperties - Get in Touch</title>
        <meta 
          name="description" 
          content="Have questions about properties in Dehradun? Contact DoonProperties for property inquiries, support, and collaboration. Call, email, or visit us." 
        />
        <meta 
          name="keywords" 
          content="contact doonproperties, property dealer dehradun, real estate contact, property support, buy property dehradun" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Contact DoonProperties - Get in Touch" />
        <meta property="og:description" content="Have questions about properties in Dehradun? Contact us today." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact DoonProperties</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full border rounded-lg p-3" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="email" placeholder="Your Email" className="w-full border rounded-lg p-3" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="text" placeholder="Subject" className="w-full border rounded-lg p-3" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                <textarea rows="5" placeholder="Your Message" className="w-full border rounded-lg p-3" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Send Message</button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Get in touch</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-blue-600" /><span>Dehradun, Uttarakhand, India</span></div>
                               <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-600" /><span>support@doonproperties.in</span></div>
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-600" /><span>Mon-Sat: 10 AM to 7 PM</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;