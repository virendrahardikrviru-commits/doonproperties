import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

const GoogleOAuthPopup = ({ isOpen, onClose, onSelectAccount }) => {
  if (!isOpen) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = JSON.parse(atob(credential.split('.')[1]));
      
      const userData = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        avatarInitial: decoded.name.charAt(0).toUpperCase()
      };
      
      onSelectAccount(userData);
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Login failed. Please try again.');
      onClose();
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    toast.error('Google login failed. Please try again.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sign in to Dehradun Estates</h2>
          <p className="text-gray-600 mt-2">Continue with Google to access all features</p>
        </div>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthPopup;