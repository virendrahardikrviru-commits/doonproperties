
import React from 'react';
import { Phone, Mail, User, ShieldCheck } from 'lucide-react';

const BlurredContactSection = ({ seller, isLoggedIn }) => {
  // Use provided seller details or fallbacks
  const sellerName = seller?.name || 'Property Owner';
  const sellerType = seller?.type || 'Owner';
  const sellerPhone = seller?.phone || '+91 98765 43210';
  const sellerEmail = seller?.email || 'contact@example.com';
  const isVerified = seller?.verificationStatus === 'Verified';

  return (
    <div className="bg-card p-6 lg:p-8 flex flex-col h-full w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            {sellerName}
            {isVerified && <ShieldCheck className="w-5 h-5 text-green-500" title="Verified" />}
          </h3>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md mt-1 inline-block">
            {sellerType}
          </span>
        </div>
      </div>

      <div className={`space-y-4 ${isLoggedIn ? 'unblur-content' : 'blur-content'}`}>
        <div className="flex items-center p-3 rounded-lg border border-border bg-background">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mr-3 text-primary">
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Number</span>
            {isLoggedIn ? (
              <a href={`tel:${sellerPhone.replace(/\s+/g, '')}`} className="text-base font-bold text-foreground hover:text-primary transition-colors">
                {sellerPhone}
              </a>
            ) : (
              <span className="text-base font-bold text-foreground">
                +91 XXXXX XXXXX
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center p-3 rounded-lg border border-border bg-background">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mr-3 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col w-full overflow-hidden">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</span>
            {isLoggedIn ? (
              <a href={`mailto:${sellerEmail}`} className="text-base font-bold text-foreground hover:text-primary transition-colors truncate">
                {sellerEmail}
              </a>
            ) : (
              <span className="text-base font-bold text-foreground">
                hidden@example.com
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlurredContactSection;
