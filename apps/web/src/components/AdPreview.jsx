import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Home, MapPin, Plus, Power, Trash2 } from 'lucide-react';

const formatPrice = (price, category) => {
  const value = Number(price || 0);
  const formatted = value.toLocaleString('en-IN');
  const suffix = ['residential_rent', 'commercial_rent', 'pg_rent'].includes(category) ? '/month' : '';
  return `Rs. ${formatted}${suffix}`;
};

const getPreviewImages = (listing, formData) => {
  if (Array.isArray(listing?.images) && listing.images.length > 0) return listing.images;
  return (formData.photos || []).map((photo) => photo.previewUrl).filter(Boolean);
};

const DetailItem = ({ label, value }) => {
  if (value === '' || value === null || value === undefined || value === false) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value === true ? 'Yes' : value}</dd>
    </div>
  );
};

const getCategoryDetails = (formData) => {
  if (formData.category === 'land_plot') {
    return [
      ['Type', formData.landListingType],
      ['Plot Area', formData.plotArea],
      ['Length', formData.length],
      ['Breadth', formData.breadth],
      ['Facing', formData.facing],
      ['Project Name', formData.projectName]
    ];
  }

  if (formData.category === 'pg_rent') {
    return [
      ['Subtype', formData.pgSubtype],
      ['Car Parking', formData.carParking],
      ['Meals Included', formData.mealsIncluded]
    ];
  }

  if (formData.category === 'commercial_sale' || formData.category === 'commercial_rent') {
    return [
      ['Furnishing', formData.furnishing],
      ['Project Status', formData.projectStatus],
      ['Super Builtup Area', formData.superBuiltupArea ? `${formData.superBuiltupArea} sqft` : ''],
      ['Carpet Area', formData.carpetArea ? `${formData.carpetArea} sqft` : ''],
      ['Maintenance', formData.maintenance ? `Rs. ${Number(formData.maintenance).toLocaleString('en-IN')}/month` : ''],
      ['Car Parking', formData.carParking],
      ['Washrooms', formData.washrooms],
      ['Project Name', formData.projectName]
    ];
  }

  return [
    ['Property Type', formData.propertyType],
    ['BHK', formData.bhk],
    ['Bathrooms', formData.bathrooms],
    ['Furnishing', formData.furnishing],
    ['Project Status', formData.projectStatus],
    ['Super Builtup Area', formData.superBuiltupArea ? `${formData.superBuiltupArea} sqft` : ''],
    ['Carpet Area', formData.carpetArea ? `${formData.carpetArea} sqft` : ''],
    ['Bachelors Allowed', formData.bachelorsAllowed],
    ['Maintenance', formData.maintenance ? `Rs. ${Number(formData.maintenance).toLocaleString('en-IN')}/month` : ''],
    ['Total Floors', formData.totalFloors],
    ['Floor No', formData.floorNo],
    ['Car Parking', formData.carParking],
    ['Facing', formData.facing],
    ['Project Name', formData.projectName]
  ];
};

const AdPreview = ({
  listing,
  formData,
  categoryLabel,
  onEdit,
  onDelete,
  onToggleActive,
  onPostAnother,
  onContinueToSearch,
  isDeleting,
  isTogglingActive
}) => {
  const images = getPreviewImages(listing, formData);
  const isActive = listing?.is_active !== false && formData.isActive !== false;
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200';

  const confirmDelete = () => {
    if (window.confirm('Delete this ad permanently?')) {
      onDelete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
            Preview Ad
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
            {isActive ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{formData.title}</h2>
        <p className="text-sm text-gray-500">Review the complete ad as it will appear on Dehradun Estates.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-gray-100">
            <img src={mainImage} alt={formData.title} className="h-72 w-full object-cover lg:h-full" />
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-blue-600">{categoryLabel}</p>
              <h3 className="mt-1 text-2xl font-extrabold text-blue-700">
                {formatPrice(formData.price, formData.category)}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{formData.location}</span>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-700">{formData.description}</p>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-900">Seller Details</p>
              <p className="mt-1 text-sm text-gray-600">Listed by {formData.listedBy}</p>
              <p className="text-sm text-gray-600">{formData.name}</p>
              <p className="text-sm text-gray-600">{formData.phone}</p>
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2 border-t border-gray-100 p-3">
            {images.slice(0, 5).map((image, index) => (
              <img key={image || index} src={image} alt={`Preview ${index + 1}`} className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {getCategoryDetails(formData).map(([label, value]) => (
          <DetailItem key={label} label={label} value={value} />
        ))}
      </dl>

      <div className="grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-5">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Ad
        </Button>
        <Button variant="outline" onClick={confirmDelete} disabled={isDeleting} className="border-red-200 text-red-600 hover:bg-red-50">
          {isDeleting ? <LoaderIcon /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete Ad
        </Button>
        <Button variant="outline" onClick={onToggleActive} disabled={isTogglingActive}>
          {isTogglingActive ? <LoaderIcon /> : <Power className="mr-2 h-4 w-4" />}
          {isActive ? 'Disable Ad' : 'Enable Ad'}
        </Button>
        <Button variant="outline" onClick={onPostAnother}>
          <Plus className="mr-2 h-4 w-4" />
          Post Another Ad
        </Button>
        <Button onClick={onContinueToSearch} className="bg-blue-600 text-white hover:bg-blue-700">
          <Home className="mr-2 h-4 w-4" />
          Continue to Search
        </Button>
      </div>
    </div>
  );
};

const LoaderIcon = () => (
  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
);

export default AdPreview;
