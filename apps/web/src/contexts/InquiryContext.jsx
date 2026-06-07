
import React, { createContext, useContext, useState, useEffect } from 'react';

const InquiryContext = createContext();

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    const storedInquiries = localStorage.getItem('app_inquiries');
    if (storedInquiries) {
      setInquiries(JSON.parse(storedInquiries));
    }
  }, []);

  const addInquiry = (inquiryData) => {
    const newInquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      read_status: false
    };

    setInquiries(prev => {
      const updated = [newInquiry, ...prev];
      localStorage.setItem('app_inquiries', JSON.stringify(updated));
      return updated;
    });

    return newInquiry;
  };

  const toggleReadStatus = (inquiryId) => {
    setInquiries(prev => {
      const updated = prev.map(inq => 
        inq.id === inquiryId ? { ...inq, read_status: !inq.read_status } : inq
      );
      localStorage.setItem('app_inquiries', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteInquiry = (inquiryId) => {
    setInquiries(prev => {
      const updated = prev.filter(inq => inq.id !== inquiryId);
      localStorage.setItem('app_inquiries', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <InquiryContext.Provider value={{
      inquiries,
      addInquiry,
      toggleReadStatus,
      deleteInquiry
    }}>
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};
