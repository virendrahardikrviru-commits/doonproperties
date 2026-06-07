
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useReport } from '@/contexts/ReportContext.jsx';
import { useFilter } from '@/contexts/FilterContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const ReportListingModal = ({ isOpen, onClose, propertyId }) => {
  const { addReport } = useReport();
  const { markAsReported } = useFilter();
  const { user } = useAuth();
  
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addReport({
        listing_id: propertyId,
        reason,
        additional_details: details,
        reporter_email: user?.email || 'anonymous'
      });
      
      markAsReported(propertyId);
      
      setIsSubmitting(false);
      toast.success('Thank you. This listing has been reported and will be reviewed by admin.');
      
      setTimeout(() => {
        onClose();
        setReason('');
        setDetails('');
      }, 3000);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Report This Listing</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Help us keep Dehradun Estates safe. Please select a reason:
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Fake Price" id="r1" />
              <Label htmlFor="r1" className="text-base font-medium cursor-pointer">Fake Price</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Spam/Fraud" id="r2" />
              <Label htmlFor="r2" className="text-base font-medium cursor-pointer">Spam/Fraud</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Property Sold" id="r3" />
              <Label htmlFor="r3" className="text-base font-medium cursor-pointer">Property Sold</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Wrong Location" id="r4" />
              <Label htmlFor="r4" className="text-base font-medium cursor-pointer">Wrong Location</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-semibold">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide any extra information to help us investigate..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingModal;
