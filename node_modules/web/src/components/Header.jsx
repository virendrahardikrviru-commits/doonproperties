import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import SignInModal from './SignInModal.jsx';
import PostAdWizard from './PostAdWizard.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const Header = ({ activeTab, onTabChange }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);

  // Updated tabs with proper routes - Added Land & Plots
  const tabs = [
    { name: 'All', path: '/' },
    { name: 'Residential Buy', path: '/residential-buy' },
    { name: 'Residential Rent', path: '/residential-rent' },
    { name: 'Land & Plots', path: '/land-plots' },
    { name: 'PG & Hostels', path: '/pg-hostels' },
    { name: 'Commercial Rent', path: '/commercial-rent' },
    { name: 'Commercial Buy', path: '/commercial-buy' }
  ];

  const handleTabClick = (path) => {
    navigate(path);
    if (onTabChange) onTabChange(path);
    setIsMobileMenuOpen(false);
  };

  const handlePostAdClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsSignInOpen(true);
    } else {
      setIsPostAdOpen(true);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-40 shadow-sm h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo with Image */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="DoonProperties" 
                className="h-16 w-auto"
              />
              <span className="text-xl font-bold text-blue-600">DoonProperties</span>
            </Link>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6 h-full">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.path)}
                className={`nav-tab h-full flex items-center text-sm font-medium transition-colors ${
                  location.pathname === tab.path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-5">
            {!isLoggedIn ? (
              <button onClick={() => setIsSignInOpen(true)} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                Sign In / Sign Up
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/chat')}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none rounded-full">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
                      {user?.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user?.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user?.avatarInitial || user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 p-2 bg-white shadow-lg border rounded-xl">
                    <div className="px-2 py-2 mb-1">
                      <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-3" /> My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/chat')} className="cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-3" /> Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <button
              onClick={handlePostAdClick}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-bold text-sm shadow-sm hover:bg-blue-700 transition-all"
            >
              + Post Ad
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <button onClick={() => navigate('/chat')} className="p-2 mr-2 text-gray-500">
                <MessageSquare className="w-6 h-6" />
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b shadow-xl py-4 px-4 max-h-[calc(100vh-72px)] overflow-y-auto">
            <nav className="flex flex-col space-y-2 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.path)}
                  className="text-left px-4 py-3 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {tab.name}
                </button>
              ))}
            </nav>
            <div className="flex flex-col space-y-4 pt-4 border-t">
              {!isLoggedIn ? (
                <button onClick={() => { setIsSignInOpen(true); setIsMobileMenuOpen(false); }} className="text-left text-base font-semibold text-gray-700 py-2">
                  Sign In / Sign Up
                </button>
              ) : (
                <>
                  <div className="flex items-center space-x-4 pb-4 border-b">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                      {user?.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user?.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user?.avatarInitial || user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} className="text-left py-2 flex items-center">
                    <LayoutDashboard className="w-5 h-5 mr-3 text-blue-600" /> My Dashboard
                  </button>
                  <button onClick={() => { navigate('/chat'); setIsMobileMenuOpen(false); }} className="text-left py-2 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-blue-600" /> Messages
                  </button>
                  <button onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }} className="text-left py-2 flex items-center text-red-600">
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </button>
                </>
              )}
              <button onClick={handlePostAdClick} className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-center">
                + Post Ad
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Updated SignInModal with both Sign In and Sign Up tabs */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <PostAdWizard isOpen={isPostAdOpen} onClose={() => setIsPostAdOpen(false)} />
    </>
  );
};

export default Header;