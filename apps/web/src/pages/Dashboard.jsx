
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { LogOut } from 'lucide-react';
import { Helmet } from 'react-helmet';
import MyListings from '@/components/MyListings.jsx';
import SavedProperties from '@/components/SavedProperties.jsx';
import InquiriesReceived from '@/components/InquiriesReceived.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'listings');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>My Dashboard - Dehradun Estates</title>
      </Helmet>
      
      <div className="min-h-screen bg-background pt-[104px] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border mb-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-extrabold shadow-sm flex-shrink-0">
                {user?.avatarInitial || 'U'}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{user?.name || 'User'}</h1>
                <p className="text-muted-foreground mt-1">{user?.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-destructive bg-destructive/10 hover:bg-destructive/20 px-5 py-2.5 rounded-lg font-bold transition-colors w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('listings')} 
              className={`pb-4 text-base sm:text-lg font-bold transition-colors relative whitespace-nowrap px-1 ${activeTab === 'listings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              My Listings
              {activeTab === 'listings' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('inquiries')} 
              className={`pb-4 text-base sm:text-lg font-bold transition-colors relative whitespace-nowrap px-1 ${activeTab === 'inquiries' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Inquiries Received
              {activeTab === 'inquiries' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`pb-4 text-base sm:text-lg font-bold transition-colors relative whitespace-nowrap px-1 ${activeTab === 'saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Saved Properties
              {activeTab === 'saved' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'listings' && <MyListings />}
            {activeTab === 'inquiries' && <InquiriesReceived />}
            {activeTab === 'saved' && <SavedProperties />}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
