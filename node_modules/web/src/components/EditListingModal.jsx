import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, X, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

const EditListingModal = ({ isOpen, onClose, listing, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    propertyType: '',
    bhk: '',
    bathrooms: '',
    furnishing: '',
    superBuiltupArea: '',
    carpetArea: '',
    facing: '',
    status: '',
    carParking: '',
    maintenance: '',
    projectName: ''
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removedOriginalImages, setRemovedOriginalImages] = useState([]);

  useEffect(() => {
    if (listing && isOpen) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        location: listing.location || '',
        category: listing.category || '',
        propertyType: listing.property_type || listing.propertyType || '',
        bhk: listing.bhk || '',
        bathrooms: listing.bathrooms || '',
        furnishing: listing.furnishing || '',
        superBuiltupArea: listing.super_builtup_area || listing.superBuiltupArea || '',
        carpetArea: listing.carpet_area || listing.carpetArea || '',
        facing: listing.facing_direction || listing.facing || '',
        status: listing.status || '',
        carParking: listing.car_parking || listing.carParking || '',
        maintenance: listing.maintenance || '',
        projectName: listing.project_name || listing.projectName || ''
      });
      
      // Load existing images in order
      if (listing.images && Array.isArray(listing.images)) {
        setImages([...listing.images]);
      } else {
        setImages([]);
      }
      setImageFiles([]);
      setRemovedOriginalImages([]);
    }
  }, [listing, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...urls]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    const imageToRemove = images[idx];
    
    // Check if this is an original image (not a newly uploaded blob)
    if (imageToRemove && !imageToRemove.startsWith('blob:')) {
      setRemovedOriginalImages(prev => [...prev, imageToRemove]);
    }
    
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const setAsMainPhoto = (idx) => {
    // Move selected image to front
    const newImages = [...images];
    const selectedImage = newImages[idx];
    newImages.splice(idx, 1);
    newImages.unshift(selectedImage);
    setImages(newImages);
    toast.success('Main photo updated! Click Save Changes to apply.');
  };

  const uploadNewImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls = [];
    
    for (const file of imageFiles) {
      const uploadFormData = new FormData();
      uploadFormData.append('images', file);
      
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });
        
        const result = await response.json();
        if (result.success && result.data && result.data.length) {
          result.data.forEach(fileData => {
            if (fileData.url) uploadedUrls.push(fileData.url);
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setUploadingImages(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Upload new images first
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        newImageUrls = await uploadNewImages();
      }
      
      // Final images order: 
      // 1. Existing images that are kept (in current order)
      // 2. Newly uploaded images
      const existingKeptImages = images.filter(img => 
        !img.startsWith('blob:') && !removedOriginalImages.includes(img)
      );
      
      // Preserve the order from 'images' state (which already has main photo first)
      const finalImages = [...existingKeptImages, ...newImageUrls];
      
      console.log('Final images order:', finalImages);
      
      const response = await fetch(`http://localhost:5000/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: finalImages
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Listing updated successfully!');
        if (onUpdate) onUpdate();
        onClose();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const furnishingOptions = ['Unfurnished', 'Semi-Furnished', 'Furnished'];
  const statusOptions = ['Ready to Move', 'Under Construction', 'New Launch'];
  const bhkOptions = ['1', '2', '3', '4', '5'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Listing Details</DialogTitle>
          <DialogDescription>
            Update the information for your property listing. You can also add, remove, or change the main photo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Property Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Modern 3BHK Apartment"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Price *</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 12500000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Location *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Rajpur Road"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Property Type</label>
              <input
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Flats/Apartments"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">BHK</label>
              <select
                name="bhk"
                value={formData.bhk}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select BHK</option>
                {bhkOptions.map(bhk => (
                  <option key={bhk} value={bhk}>{bhk} BHK</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Bathrooms</label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select</option>
                {[1,2,3,4,5].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Furnishing</label>
              <select
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select</option>
                {furnishingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Super Builtup Area (sqft)</label>
              <input
                name="superBuiltupArea"
                value={formData.superBuiltupArea}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 1500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Carpet Area (sqft)</label>
              <input
                name="carpetArea"
                value={formData.carpetArea}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 1200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Facing</label>
              <input
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. North"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select</option>
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Car Parking</label>
              <input
                name="carParking"
                value={formData.carParking}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Maintenance (Monthly)</label>
              <input
                name="maintenance"
                value={formData.maintenance}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Project Name</label>
              <input
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Sunshine Heights"
              />
            </div>

            {/* Image Upload Section with "Set as Main Photo" */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Photos (First photo will be the main display photo)</label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  id="editImageUpload"
                  disabled={uploadingImages}
                />
                <label htmlFor="editImageUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Click to add more photos</span>
                </label>
              </div>
              
              {uploadingImages && (
                <div className="text-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  <span className="text-sm">Uploading images...</span>
                </div>
              )}
              
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button 
                            onClick={() => setAsMainPhoto(idx)}
                            className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition"
                            title="Set as main photo"
                            type="button"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button 
                          onClick={() => removeImage(idx)}
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                          title="Remove photo"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" /> Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">💡 Tip: Click the star icon on any photo to set it as the main display photo, then click Save Changes.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Description *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe the property features..."
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting || uploadingImages ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingModal;