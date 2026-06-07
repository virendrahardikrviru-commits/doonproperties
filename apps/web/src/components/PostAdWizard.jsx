import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { ArrowLeft, Check, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import AdPreview from './AdPreview.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LOCATIONS = [
  'Rajpur Road', 'Jakhan', 'Vasant Vihar', 'Clement Town',
  'Bidholi', 'Sahastradhara Road', 'Paltan Bazaar', 'Chakrata Road',
  'Ballupur', 'GMS Road', 'Haridwar Road', 'Mussoorie Road',
  'Patel Nagar', 'Nehru Colony', 'Dharampur', 'Prem Nagar',
  'Selaqui', 'Doiwala', 'Raipur', 'Bhaniyawala',
  'Indira Nagar', 'Kaulagarh Road', 'Banjarawala', 'Turner Road',
  'Rajpur', 'Kishanpur', 'Malsi', 'Purkul', 'Sudhowala',
  'IT Park Area', 'Race Course', 'Subhash Nagar'
];

const CATEGORY_OPTIONS = [
  { id: 'residential_sale', label: 'Residential Buy', description: 'Sell flats, builder floors, villas, duplexes, and homes.' },
  { id: 'residential_rent', label: 'Residential Rent', description: 'List homes, apartments, and villas available for rent.' },
  { id: 'land_plot', label: 'Land & Plots', description: 'Post land or plot ads for sale or rent.' },
  { id: 'pg_rent', label: 'PG & Student Hostels', description: 'List PGs, guest houses, and student hostel spaces.' },
  { id: 'commercial_rent', label: 'Commercial Rent', description: 'Advertise commercial spaces available for rent.' },
  { id: 'commercial_sale', label: 'Commercial Buy', description: 'Sell offices, shops, showrooms, and commercial spaces.' }
];

const PROPERTY_TYPES = ['Flats/Apartments', 'Independent Builder Floors', 'Farmhouse', 'House & Villa', 'Duplex'];
const BHK_OPTIONS = ['1', '2', '3', '4', '5'];
const BATHROOM_OPTIONS = ['1', '2', '3', '4', '5'];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Furnished'];
const COMMERCIAL_FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const LISTED_BY_OPTIONS = ['Builder', 'Dealer', 'Owner'];
const PARKING_OPTIONS = ['1', '2', '3', '4'];
const COMMERCIAL_PARKING_OPTIONS = ['1', '2', '3', '4', '5+'];
const FACING_OPTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
const LAND_FACING_OPTIONS = ['East', 'North', 'North-East', 'North-West', 'South', 'South-East', 'South-West', 'West'];
const COMMERCIAL_STATUS_OPTIONS = ['New Launch', 'Ready to Move', 'Under Construction'];

const CATEGORY_FIELD_KEYS = [
  'propertyType', 'bhk', 'bathrooms', 'furnishing', 'projectStatus',
  'superBuiltupArea', 'carpetArea', 'maintenance', 'totalFloors', 'floorNo',
  'carParking', 'facing', 'projectName', 'bachelorsAllowed', 'landListingType',
  'plotArea', 'length', 'breadth', 'pgSubtype', 'mealsIncluded', 'washrooms'
];

const EMPTY_FORM_DATA = {
  category: '',
  propertyType: '',
  bhk: '',
  bathrooms: '',
  furnishing: '',
  projectStatus: '',
  superBuiltupArea: '',
  carpetArea: '',
  maintenance: '',
  totalFloors: '',
  floorNo: '',
  carParking: '',
  facing: '',
  projectName: '',
  bachelorsAllowed: false,
  landListingType: '',
  plotArea: '',
  length: '',
  breadth: '',
  pgSubtype: '',
  mealsIncluded: false,
  washrooms: '',
  location: '',
  title: '',
  description: '',
  price: '',
  listedBy: '',
  name: '',
  phone: '',
  photos: [],
  isActive: true
};

const getCategoryLabel = (categoryId) => (
  CATEGORY_OPTIONS.find((category) => category.id === categoryId)?.label || 'Property'
);

const clearCategoryFields = (data) => {
  const next = { ...data };
  CATEGORY_FIELD_KEYS.forEach((key) => {
    next[key] = typeof EMPTY_FORM_DATA[key] === 'boolean' ? false : '';
  });
  return next;
};

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getImageUrls = (listing) => {
  if (Array.isArray(listing?.images)) return listing.images;
  if (typeof listing?.images === 'string') {
    try {
      const parsed = JSON.parse(listing.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const ButtonGroup = ({ label, options, value, onChange, required = false }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold">
      {label}{required && ' *'}
    </Label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            value === option
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const FormField = ({ label, required = false, children }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold">
      {label}{required && ' *'}
    </Label>
    {children}
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, required = false }) => (
  <FormField label={label} required={required}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

const PostAdWizard = ({ isOpen, onClose }) => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('form');
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [submittedListing, setSubmittedListing] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const categoryLabel = useMemo(() => getCategoryLabel(formData.category), [formData.category]);

  useEffect(() => {
    if (isOpen && user?.name && !formData.name) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [formData.name, isOpen, user?.name]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetWizard = () => {
    setStep(1);
    setMode('form');
    setFormData({
      ...EMPTY_FORM_DATA,
      name: user?.name || ''
    });
    setSubmittedListing(null);
    setEditingListingId(null);
    setIsSubmitting(false);
    setUploadingImages(false);
    setIsDeleting(false);
    setIsTogglingActive(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const selectCategory = (categoryId) => {
    setFormData((prev) => {
      const next = clearCategoryFields(prev);
      next.category = categoryId;
      next.projectStatus = categoryId === 'residential_sale' ? 'Ready to Move' : '';
      return next;
    });
    setStep(2);
  };

  const validateStep2 = () => {
    const missing = [];

    if (!formData.title.trim()) missing.push('Ad Title');
    if (!formData.description.trim()) missing.push('Description');
    if (!formData.location) missing.push('Location');

    if (formData.category === 'residential_sale') {
      if (!formData.propertyType) missing.push('Property Type');
      if (!formData.bhk) missing.push('BHK');
      if (!formData.bathrooms) missing.push('Bathrooms');
      if (!formData.furnishing) missing.push('Furnishing');
      if (!formData.superBuiltupArea) missing.push('Super Builtup Area');
      if (!formData.carpetArea) missing.push('Carpet Area');
    }

    if (formData.category === 'residential_rent') {
      if (!formData.propertyType) missing.push('Property Type');
      if (!formData.bhk) missing.push('BHK');
      if (!formData.bathrooms) missing.push('Bathrooms');
      if (!formData.furnishing) missing.push('Furnishing');
      if (!formData.superBuiltupArea) missing.push('Super Builtup Area');
      if (!formData.carpetArea) missing.push('Carpet Area');
    }

    if (formData.category === 'land_plot') {
      if (!formData.landListingType) missing.push('Type');
      if (!formData.plotArea) missing.push('Plot Area');
    }

    if (formData.category === 'pg_rent') {
      if (!formData.pgSubtype) missing.push('Subtype');
    }

    if (formData.category === 'commercial_sale') {
      if (!formData.furnishing) missing.push('Furnishing');
      if (!formData.projectStatus) missing.push('Project Status');
      if (!formData.superBuiltupArea) missing.push('Super Builtup Area');
      if (!formData.carpetArea) missing.push('Carpet Area');
      if (!formData.washrooms) missing.push('Washrooms');
    }

    if (formData.category === 'commercial_rent') {
      if (!formData.furnishing) missing.push('Furnishing');
      if (!formData.superBuiltupArea) missing.push('Super Builtup Area');
      if (!formData.carpetArea) missing.push('Carpet Area');
      if (!formData.washrooms) missing.push('Washrooms');
    }

    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.join(', ')}`);
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }

    if (!formData.listedBy) {
      toast.error('Please select who the ad is listed by');
      return false;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter seller name');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && !formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const availableSlots = 5 - formData.photos.length;
    if (availableSlots <= 0) {
      toast.error('You can upload up to 5 photos');
      event.target.value = '';
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.info(`Only ${availableSlots} more photo(s) can be added`);
    }

    const nextPhotos = acceptedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadedUrl: ''
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...nextPhotos]
    }));

    event.target.value = '';
  };

  const removePhoto = (photoId) => {
    setFormData((prev) => {
      const photo = prev.photos.find((item) => item.id === photoId);
      if (photo?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return {
        ...prev,
        photos: prev.photos.filter((item) => item.id !== photoId)
      };
    });
  };

  const uploadNewPhotos = async () => {
    const existingUrls = formData.photos
      .filter((photo) => photo.uploadedUrl && !photo.file)
      .map((photo) => photo.uploadedUrl);

    const newFiles = formData.photos.filter((photo) => photo.file).map((photo) => photo.file);
    if (!newFiles.length) return existingUrls;

    setUploadingImages(true);

    try {
      const uploadFormData = new FormData();
      newFiles.forEach((file) => uploadFormData.append('images', file));

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Image upload failed');
      }

      const uploadedUrls = Array.isArray(result.data)
        ? result.data.map((item) => item.url).filter(Boolean)
        : [result.data?.url].filter(Boolean);

      if (uploadedUrls.length !== newFiles.length) {
        toast.warning('Some photos may not have uploaded');
      }

      return [...existingUrls, ...uploadedUrls];
    } finally {
      setUploadingImages(false);
    }
  };

  // ✅ Helper function to update user's phone number
  const updateUserPhoneNumber = async (phoneNumber) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE_URL}/auth/update-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: phoneNumber })
      });
    } catch (error) {
      console.log('Phone update failed, but ad was created');
    }
  };

  const buildPayload = (imageUrls, isActive = formData.isActive) => {
    const common = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      location: formData.location,
      category: formData.category,
      sellerType: formData.listedBy,
      contactName: formData.name.trim(),
      contactPhone: formData.phone.trim(),
      images: imageUrls,
      isActive
    };

    if (formData.category === 'land_plot') {
      return {
        ...common,
        propertyType: formData.landListingType,
        landType: formData.landListingType,
        superBuiltupArea: normalizeNumber(formData.plotArea),
        carpetArea: null,
        facing: formData.facing,
        projectName: formData.projectName,
        totalFloors: formData.length,
        floorNo: formData.breadth,
        amenities: [
          formData.length ? `Length: ${formData.length}` : '',
          formData.breadth ? `Breadth: ${formData.breadth}` : ''
        ].filter(Boolean)
      };
    }

    if (formData.category === 'pg_rent') {
      return {
        ...common,
        propertyType: formData.pgSubtype,
        roomType: formData.pgSubtype,
        carParking: formData.carParking,
        mealsIncluded: formData.mealsIncluded,
        amenities: formData.mealsIncluded ? ['Meals Included'] : []
      };
    }

    return {
      ...common,
      propertyType: formData.propertyType,
      bhk: formData.bhk,
      bathrooms: formData.bathrooms,
      furnishing: formData.furnishing,
      superBuiltupArea: normalizeNumber(formData.superBuiltupArea),
      carpetArea: normalizeNumber(formData.carpetArea),
      facing: formData.facing,
      status: formData.projectStatus,
      projectName: formData.projectName,
      totalFloors: formData.totalFloors,
      floorNo: formData.floorNo,
      carParking: formData.carParking,
      maintenance: normalizeNumber(formData.maintenance),
      washrooms: formData.washrooms,
      amenities: formData.bachelorsAllowed ? ['Bachelors Allowed'] : []
    };
  };

  const hydratePhotosFromUrls = (urls) => (
    urls.slice(0, 5).map((url, index) => ({
      id: `existing-${index}-${url}`,
      previewUrl: url,
      uploadedUrl: url
    }))
  );

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to post an ad');
      return;
    }

    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      const imageUrls = await uploadNewPhotos();
      const payload = buildPayload(imageUrls, formData.isActive);
      const token = localStorage.getItem('auth_token');
      const url = editingListingId
        ? `${API_BASE_URL}/listings/${editingListingId}`
        : `${API_BASE_URL}/listings`;

      const response = await fetch(url, {
        method: editingListingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save listing');
      }

      // ✅ Update user's phone number after successful ad posting
      if (formData.phone && formData.phone.trim()) {
        await updateUserPhoneNumber(formData.phone.trim());
      }

      const listing = {
        ...result.data,
        images: getImageUrls(result.data),
        is_active: result.data?.is_active ?? payload.isActive
      };

      setSubmittedListing(listing);
      setEditingListingId(listing.id);
      setFormData((prev) => ({
        ...prev,
        photos: hydratePhotosFromUrls(listing.images),
        isActive: listing.is_active !== false
      }));
      setMode('preview');
      toast.success(editingListingId ? 'Ad updated successfully!' : 'Ad posted successfully!');
    } catch (error) {
      console.error('Post ad error:', error);
      toast.error(error.message || 'Failed to save ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAd = () => {
    setMode('form');
    setStep(2);
  };

  const handleDeleteAd = async () => {
    if (!submittedListing?.id) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/listings/${submittedListing.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete ad');
      }

      toast.success('Ad deleted successfully');
      resetWizard();
    } catch (error) {
      console.error('Delete ad error:', error);
      toast.error(error.message || 'Failed to delete ad');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!submittedListing?.id) return;

    const nextActive = !(submittedListing.is_active !== false);
    setIsTogglingActive(true);

    try {
      const imageUrls = getImageUrls(submittedListing);
      const payload = buildPayload(imageUrls, nextActive);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/listings/${submittedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update ad status');
      }

      setSubmittedListing((prev) => ({
        ...prev,
        ...result.data,
        images: getImageUrls(result.data),
        is_active: result.data?.is_active ?? nextActive
      }));
      setFormData((prev) => ({ ...prev, isActive: nextActive }));
      toast.success(nextActive ? 'Ad enabled' : 'Ad disabled');
    } catch (error) {
      console.error('Toggle ad status error:', error);
      toast.error(error.message || 'Failed to update ad status');
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handlePostAnother = () => {
    resetWizard();
  };

  const handleContinueToSearch = () => {
    resetWizard();
    onClose();
    navigate('/');
  };

  const renderCommonStep2Fields = () => (
    <div className="space-y-4 border-t pt-5">
      <SelectField
        label="Location"
        required
        value={formData.location}
        onChange={(value) => updateField('location', value)}
        options={LOCATIONS}
        placeholder="Select Dehradun locality"
      />

      <FormField label="Ad Title" required>
        <Input
          value={formData.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Write a clear title for your ad"
        />
      </FormField>

      <FormField label="Description" required>
        <Textarea
          rows={4}
          value={formData.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Describe the property, locality, nearby landmarks, and other details"
        />
      </FormField>
    </div>
  );

  const renderResidentialBuyFields = () => (
    <div className="space-y-5">
      <ButtonGroup label="Property Type" required options={PROPERTY_TYPES} value={formData.propertyType} onChange={(value) => updateField('propertyType', value)} />
      <div className="grid gap-5 md:grid-cols-2">
        <ButtonGroup label="BHK" required options={BHK_OPTIONS} value={formData.bhk} onChange={(value) => updateField('bhk', value)} />
        <ButtonGroup label="Bathrooms" required options={BATHROOM_OPTIONS} value={formData.bathrooms} onChange={(value) => updateField('bathrooms', value)} />
      </div>
      <ButtonGroup label="Furnishing" required options={FURNISHING_OPTIONS} value={formData.furnishing} onChange={(value) => updateField('furnishing', value)} />
      <ButtonGroup label="Project Status" options={['Ready to Move']} value={formData.projectStatus} onChange={(value) => updateField('projectStatus', value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Super Builtup Area (sqft)" required>
          <Input type="number" value={formData.superBuiltupArea} onChange={(event) => updateField('superBuiltupArea', event.target.value)} placeholder="1500" />
        </FormField>
        <FormField label="Carpet Area (sqft)" required>
          <Input type="number" value={formData.carpetArea} onChange={(event) => updateField('carpetArea', event.target.value)} placeholder="1200" />
        </FormField>
        <FormField label="Maintenance (Monthly)">
          <Input type="number" value={formData.maintenance} onChange={(event) => updateField('maintenance', event.target.value)} placeholder="2500" />
        </FormField>
        <FormField label="Total Floors">
          <Input type="number" value={formData.totalFloors} onChange={(event) => updateField('totalFloors', event.target.value)} placeholder="8" />
        </FormField>
        <FormField label="Floor No">
          <Input value={formData.floorNo} onChange={(event) => updateField('floorNo', event.target.value)} placeholder="3 or Ground" />
        </FormField>
        <SelectField label="Facing" value={formData.facing} onChange={(value) => updateField('facing', value)} options={FACING_OPTIONS} />
      </div>
      <ButtonGroup label="Car Parking" options={PARKING_OPTIONS} value={formData.carParking} onChange={(value) => updateField('carParking', value)} />
      <FormField label="Project Name">
        <Input value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Project or society name" />
      </FormField>
    </div>
  );

  const renderResidentialRentFields = () => (
    <div className="space-y-5">
      <SelectField label="Property Type" required value={formData.propertyType} onChange={(value) => updateField('propertyType', value)} options={PROPERTY_TYPES} />
      <div className="grid gap-5 md:grid-cols-2">
        <ButtonGroup label="BHK" required options={BHK_OPTIONS} value={formData.bhk} onChange={(value) => updateField('bhk', value)} />
        <ButtonGroup label="Bathrooms" required options={BATHROOM_OPTIONS} value={formData.bathrooms} onChange={(value) => updateField('bathrooms', value)} />
      </div>
      <ButtonGroup label="Furnishing" required options={FURNISHING_OPTIONS} value={formData.furnishing} onChange={(value) => updateField('furnishing', value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Super Builtup Area (sqft)" required>
          <Input type="number" value={formData.superBuiltupArea} onChange={(event) => updateField('superBuiltupArea', event.target.value)} placeholder="1500" />
        </FormField>
        <FormField label="Carpet Area (sqft)" required>
          <Input type="number" value={formData.carpetArea} onChange={(event) => updateField('carpetArea', event.target.value)} placeholder="1200" />
        </FormField>
        <FormField label="Maintenance (Monthly)">
          <Input type="number" value={formData.maintenance} onChange={(event) => updateField('maintenance', event.target.value)} placeholder="2000" />
        </FormField>
        <FormField label="Total Floors">
          <Input type="number" value={formData.totalFloors} onChange={(event) => updateField('totalFloors', event.target.value)} placeholder="5" />
        </FormField>
        <FormField label="Floor No">
          <Input value={formData.floorNo} onChange={(event) => updateField('floorNo', event.target.value)} placeholder="2 or Ground" />
        </FormField>
        <SelectField label="Facing" value={formData.facing} onChange={(value) => updateField('facing', value)} options={FACING_OPTIONS} />
      </div>
      <ButtonGroup label="Car Parking" options={PARKING_OPTIONS} value={formData.carParking} onChange={(value) => updateField('carParking', value)} />
      <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm">
        <Checkbox checked={formData.bachelorsAllowed} onCheckedChange={(checked) => updateField('bachelorsAllowed', checked === true)} />
        Bachelors Allowed
      </label>
      <FormField label="Project Name">
        <Input value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Project or society name" />
      </FormField>
    </div>
  );

  const renderLandFields = () => (
    <div className="space-y-5">
      <ButtonGroup label="Type" required options={['For Sale', 'For Rent']} value={formData.landListingType} onChange={(value) => updateField('landListingType', value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Plot Area" required>
          <Input value={formData.plotArea} onChange={(event) => updateField('plotArea', event.target.value)} placeholder="5000 sqft or 600 sqyd" />
        </FormField>
        <FormField label="Length">
          <Input type="number" value={formData.length} onChange={(event) => updateField('length', event.target.value)} placeholder="80" />
        </FormField>
        <FormField label="Breadth">
          <Input type="number" value={formData.breadth} onChange={(event) => updateField('breadth', event.target.value)} placeholder="60" />
        </FormField>
        <SelectField label="Facing" value={formData.facing} onChange={(value) => updateField('facing', value)} options={LAND_FACING_OPTIONS} />
      </div>
      <FormField label="Project Name">
        <Input value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Project or colony name" />
      </FormField>
    </div>
  );

  const renderPgFields = () => (
    <div className="space-y-5">
      <ButtonGroup label="Subtype" required options={['Guest House', 'PG']} value={formData.pgSubtype} onChange={(value) => updateField('pgSubtype', value)} />
      <ButtonGroup label="Car Parking" options={PARKING_OPTIONS} value={formData.carParking} onChange={(value) => updateField('carParking', value)} />
      <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm">
        <Checkbox checked={formData.mealsIncluded} onCheckedChange={(checked) => updateField('mealsIncluded', checked === true)} />
        Meals Included
      </label>
    </div>
  );

  const renderCommercialFields = (isSale) => (
    <div className="space-y-5">
      <ButtonGroup label="Furnishing" required options={COMMERCIAL_FURNISHING_OPTIONS} value={formData.furnishing} onChange={(value) => updateField('furnishing', value)} />
      {isSale && (
        <ButtonGroup label="Project Status" required options={COMMERCIAL_STATUS_OPTIONS} value={formData.projectStatus} onChange={(value) => updateField('projectStatus', value)} />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Super Builtup Area (sqft)" required>
          <Input type="number" value={formData.superBuiltupArea} onChange={(event) => updateField('superBuiltupArea', event.target.value)} placeholder="2000" />
        </FormField>
        <FormField label="Carpet Area (sqft)" required>
          <Input type="number" value={formData.carpetArea} onChange={(event) => updateField('carpetArea', event.target.value)} placeholder="1600" />
        </FormField>
        <FormField label="Maintenance (Monthly)">
          <Input type="number" value={formData.maintenance} onChange={(event) => updateField('maintenance', event.target.value)} placeholder="5000" />
        </FormField>
        <FormField label="Project Name">
          <Input value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Commercial project name" />
        </FormField>
      </div>
      <ButtonGroup label="Car Parking" options={COMMERCIAL_PARKING_OPTIONS} value={formData.carParking} onChange={(value) => updateField('carParking', value)} />
      <ButtonGroup label="Washrooms" required options={['Yes', 'No']} value={formData.washrooms} onChange={(value) => updateField('washrooms', value)} />
    </div>
  );

  const renderCategoryFields = () => {
    if (formData.category === 'residential_sale') return renderResidentialBuyFields();
    if (formData.category === 'residential_rent') return renderResidentialRentFields();
    if (formData.category === 'land_plot') return renderLandFields();
    if (formData.category === 'pg_rent') return renderPgFields();
    if (formData.category === 'commercial_sale') return renderCommercialFields(true);
    if (formData.category === 'commercial_rent') return renderCommercialFields(false);
    return null;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="bg-white sm:max-w-4xl max-h-[92vh] overflow-y-auto">
        {!isLoggedIn ? (
          <div className="py-8 text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Sign in required</DialogTitle>
              <DialogDescription>
                You must be logged in before you can post an ad.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
              Close
            </Button>
          </div>
        ) : mode === 'preview' ? (
          <AdPreview
            listing={submittedListing}
            formData={formData}
            categoryLabel={categoryLabel}
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
            onToggleActive={handleToggleActive}
            onPostAnother={handlePostAnother}
            onContinueToSearch={handleContinueToSearch}
            isDeleting={isDeleting}
            isTogglingActive={isTogglingActive}
          />
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  Step {step} of 3
                </span>
                {editingListingId && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                    Editing posted ad
                  </span>
                )}
              </div>
              <DialogTitle className="text-2xl font-bold">Post Your Ad</DialogTitle>
              <DialogDescription>
                Select a category, add property details, then preview your ad after submission.
              </DialogDescription>
            </DialogHeader>

            <div className="my-5 grid grid-cols-3 gap-2">
              {['Category', 'Details', 'Price & Contact'].map((label, index) => {
                const itemStep = index + 1;
                const isComplete = step > itemStep;
                const isCurrent = step === itemStep;
                return (
                  <div
                    key={label}
                    className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : isComplete
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? <Check className="mx-auto mb-1 h-4 w-4" /> : null}
                    {label}
                  </div>
                );
              })}
            </div>

            <div className="py-2">
              {step === 1 && (
                <div className="space-y-4">
                  <Label className="text-base font-bold">Select Category</Label>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CATEGORY_OPTIONS.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => selectCategory(category.id)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          formData.category === category.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <span className="block font-bold text-gray-900">{category.label}</span>
                        <span className="mt-1 block text-sm text-gray-500">{category.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{categoryLabel} Details</h3>
                    <p className="text-sm text-gray-500">Fill the fields specific to this category.</p>
                  </div>
                  {renderCategoryFields()}
                  {renderCommonStep2Fields()}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Price, Photos & Contact</h3>
                    <p className="text-sm text-gray-500">Add pricing, upload up to 5 photos, and enter seller details.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Price" required>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(event) => updateField('price', event.target.value)}
                        placeholder={['residential_rent', 'commercial_rent', 'pg_rent'].includes(formData.category) ? '25000' : '12500000'}
                      />
                    </FormField>

                    <FormField label="Name" required>
                      <Input value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Seller name" />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                      />
                    </FormField>
                  </div>

                  <ButtonGroup label="Listed By" required options={LISTED_BY_OPTIONS} value={formData.listedBy} onChange={(value) => updateField('listedBy', value)} />

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Photos</Label>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center transition-colors hover:border-blue-500">
                      <input
                        id="post-ad-photos"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages || formData.photos.length >= 5}
                      />
                      <label htmlFor="post-ad-photos" className="flex cursor-pointer flex-col items-center">
                        {uploadingImages ? (
                          <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                        ) : (
                          <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {formData.photos.length >= 5 ? 'Maximum 5 photos selected' : 'Click to upload photos'}
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG, or WebP. Up to 5 photos.</span>
                      </label>
                    </div>

                    {formData.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {formData.photos.map((photo) => (
                          <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
                            <img src={photo.previewUrl} alt="Ad preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        <ImagePlus className="h-4 w-4" />
                        No photos selected yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting || uploadingImages}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button onClick={handleNext} className="bg-blue-600 text-white hover:bg-blue-700">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting || uploadingImages} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isSubmitting || uploadingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingImages ? 'Uploading photos...' : 'Saving ad...'}
                    </>
                  ) : editingListingId ? (
                    'Save & Preview'
                  ) : (
                    'Submit & Preview'
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostAdWizard;