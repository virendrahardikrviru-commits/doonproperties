import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import MainLayout from './components/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { FilterProvider } from './contexts/FilterContext.jsx';
import { InquiryProvider } from './contexts/InquiryContext.jsx';
import { ReportProvider } from './contexts/ReportContext.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';

// New Page Imports
import ResidentialBuy from './pages/ResidentialBuy';
import ResidentialRent from './pages/ResidentialRent';
import LandPlots from './pages/LandPlots';
import PGHostels from './pages/PGHostels';
import CommercialRent from './pages/CommercialRent';
import CommercialBuy from './pages/CommercialBuy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import HelpSafety from './pages/HelpSafety';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <InquiryProvider>
          <ReportProvider>
            <ChatProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  <Route element={<MainLayout />}>
                    {/* Main Pages */}
                    <Route path="/" element={<HomePage />} />
                    {/* ✅ Updated route to handle both slug and ID */}
                    <Route path="/property/:slugOrId" element={<PropertyDetail />} />
                    
                    {/* Category Pages */}
                    <Route path="/residential-buy" element={<ResidentialBuy />} />
                    <Route path="/residential-rent" element={<ResidentialRent />} />
                    <Route path="/land-plots" element={<LandPlots />} />
                    <Route path="/pg-hostels" element={<PGHostels />} />
                    <Route path="/commercial-rent" element={<CommercialRent />} />
                    <Route path="/commercial-buy" element={<CommercialBuy />} />
                    
                    {/* About & Support Pages */}
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/help-safety" element={<HelpSafety />} />
                    
                    {/* Legal Pages */}
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    
                    {/* Protected Routes (Login Required) */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Fallback */}
                    <Route path="*" element={<HomePage />} />
                  </Route>
                </Routes>
              </Router>
            </ChatProvider>
          </ReportProvider>
        </InquiryProvider>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;