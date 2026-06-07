
import React, { createContext, useContext, useState, useEffect } from 'react';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const storedReports = localStorage.getItem('app_reports');
    if (storedReports) {
      setReports(JSON.parse(storedReports));
    }
  }, []);

  const addReport = (reportData) => {
    const newReport = {
      ...reportData,
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    setReports(prev => {
      const updated = [newReport, ...prev];
      localStorage.setItem('app_reports', JSON.stringify(updated));
      return updated;
    });

    return newReport;
  };

  return (
    <ReportContext.Provider value={{
      reports,
      addReport
    }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};
