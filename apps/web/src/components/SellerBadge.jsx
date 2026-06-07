
import React from 'react';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

const SellerBadge = ({ type, name, verificationStatus }) => {
  const isOwner = type === 'Owner';
  const isVerified = verificationStatus === 'Verified';

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
      {/* Avatar Circle */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isOwner ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
        {isOwner ? <UserCheck className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
      </div>

      {/* Seller Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-lg">{name}</span>
          {isVerified && (
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-label="Verified Seller" />
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {type} {isVerified && '• Verified'}
        </span>
      </div>
    </div>
  );
};

export default SellerBadge;
