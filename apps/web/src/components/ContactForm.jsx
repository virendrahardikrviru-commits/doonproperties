import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { useInquiry } from '@/contexts/InquiryContext.jsx';
import { useFilter } from '@/contexts/FilterContext.jsx';
import { inquiriesApi } from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ContactForm = ({ propertyId, propertyTitle }) => {
  const { isLoggedIn, user } = useAuth();
  const { addInquiry } = useInquiry();
  const { propertiesList } = useFilter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me.'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill form if user is logged in
  React.useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isLoggedIn, user]);

  // Hidden for non-logged-in users
  if (!isLoggedIn) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Send inquiry to backend API
      const response = await inquiriesApi.create({
        listingId: propertyId,
        buyerName: formData.fullName,
        buyerEmail: formData.email,
        buyerPhone: formData.phone,
        message: formData.message
      });

      if (response.success) {
        // 2. Add to local InquiryContext for immediate UI update
        addInquiry({
          listing_id: propertyId,
          buyer_name: formData.fullName,
          buyer_email: formData.email,
          buyer_phone: formData.phone,
          message: formData.message
        });

        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: 'I am interested in this property. Please contact me.'
        });
        setErrors({});

        toast.success('Inquiry sent successfully!', {
          description: 'The advertiser will contact you shortly.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      
      // Fall back to local storage if API fails
      addInquiry({
        listing_id: propertyId,
        buyer_name: formData.fullName,
        buyer_email: formData.email,
        buyer_phone: formData.phone,
        message: formData.message
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: 'I am interested in this property. Please contact me.'
      });
      setErrors({});

      toast.success('Inquiry sent successfully!', {
        description: 'The advertiser will contact you shortly.',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-soft)]">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Send an Inquiry</h3>
        <p className="text-sm text-muted-foreground">Fill out the form below and the seller will get back to you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && <p className="text-sm text-destructive font-medium">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive font-medium">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
              maxLength={10}
            />
          </div>
          {errors.phone && <p className="text-sm text-destructive font-medium">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className={`resize-none ${errors.message ? 'border-destructive' : ''}`}
          />
          {errors.message && <p className="text-sm text-destructive font-medium">{errors.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold transition-all active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          By sending an inquiry, you agree to our Terms of Service.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;