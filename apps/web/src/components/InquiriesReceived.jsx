import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const InquiriesReceived = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/inquiries/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Inquiries data:', data);
      if (data.success) {
        setInquiries(data.data || []);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:5000/api/inquiries/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInquiries(); // Refresh list
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No inquiries received yet.</p>
        <p className="text-sm text-gray-400 mt-1">When buyers contact you, their inquiries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Inquiries ({inquiries.length})</h3>
        <button 
          onClick={fetchInquiries}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {inquiries.map((inquiry) => (
        <div 
          key={inquiry.id} 
          className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
            !inquiry.read_status ? 'border-l-4 border-l-blue-500' : 'border-gray-100'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{inquiry.buyer_name}</h4>
                {!inquiry.read_status && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${inquiry.buyer_email}`} className="hover:text-blue-600">
                    {inquiry.buyer_email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${inquiry.buyer_phone}`} className="hover:text-blue-600">
                    {inquiry.buyer_phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Calendar className="w-3 h-3" />
                  {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Message Section */}
              <div className="mt-3">
                <button
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {expandedId === inquiry.id ? 'Hide Message' : 'View Message'}
                </button>
                {expandedId === inquiry.id && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {inquiry.message || 'No message provided'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!inquiry.read_status && (
                <button
                  onClick={() => markAsRead(inquiry.id)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Property Info */}
          {inquiry.listing_title && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Property: <span className="font-medium">{inquiry.listing_title}</span>
              {inquiry.listing_location && ` • ${inquiry.listing_location}`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InquiriesReceived;