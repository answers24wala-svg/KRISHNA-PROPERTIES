import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { 
  Building, Upload, Image as ImageIcon, Video, Link, User, Phone, Check, AlertCircle, Plus, Minus
} from 'lucide-react';
import { Property, PropertyAgent } from '../types';
import { motion } from 'motion/react';

interface UploadViewProps {
  onAddProperty: (newProperty: Property) => void;
  onUpdateProperty?: (updatedProperty: Property) => void;
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload') => void;
  editingProperty?: Property | null;
  setEditingProperty?: (prop: Property | null) => void;
  userEmail: string | null;
}

export default function UploadView({ 
  onAddProperty, 
  onUpdateProperty, 
  setScreen, 
  editingProperty, 
  setEditingProperty,
  userEmail
}: UploadViewProps) {
  // Form input states pre-populated for editing if active
  const [title, setTitle] = useState(editingProperty?.title || '');
  const [price, setPrice] = useState(editingProperty ? String(editingProperty.price) : '');
  const [location, setLocation] = useState(editingProperty?.location || 'Prahlad Nagar, Ahmedabad');
  const [area, setArea] = useState(editingProperty ? String(editingProperty.areaSqft) : '');
  const [propertyType, setPropertyType] = useState<'Apartment' | 'Independent Villa' | 'Penthouse' | 'Commercial' | 'Flat' | 'Bungalow'>(editingProperty?.propertyType || 'Apartment');
  const [description, setDescription] = useState(editingProperty?.description || '');
  const [mapLink, setMapLink] = useState('');
  
  // Steppers (Specifications)
  const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms ?? 1);
  const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms ?? 1);
  const [parking, setParking] = useState(editingProperty?.parking ?? 0);

  // Contact Info
  const [ownerName, setOwnerName] = useState(editingProperty?.agent?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(editingProperty?.agent?.phone || '');

  // Media upload simulation
  const [uploadedImages, setUploadedImages] = useState<string[]>(editingProperty?.images || []);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>(editingProperty?.video || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Compress images on client-side to max 800px and JPEG quality 0.60
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressedBase64);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Image load error'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // Handle selected files and convert to Base64 data URLs with compression
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (!file.type.startsWith('image/')) return;
      try {
        const compressed = await compressImage(file);
        setUploadedImages((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Image compression failed, using original:', err);
        // Fallback to original Base64 if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageUploadSim = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validation
    if (!title || !price || !area || !description || !ownerName || !phoneNumber) {
      setErrorMsg('Please populate all fields marked with *');
      return;
    }

    const priceNum = parseFloat(price);
    const areaNum = parseFloat(area);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please specify a valid numeric price.');
      return;
    }

    if (isNaN(areaNum) || areaNum <= 0) {
      setErrorMsg('Please specify a valid numeric area in sq.ft.');
      return;
    }

    setIsSubmitting(true);

    const imagesList = uploadedImages.length > 0 
      ? uploadedImages 
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

    const formattedPriceStr = priceNum >= 10000000 
      ? `₹${(priceNum / 10000000).toFixed(2)} Cr` 
      : priceNum >= 100000 
        ? `₹${(priceNum / 100000).toFixed(2)} Lakh` 
        : `₹${priceNum.toLocaleString()}`;

    if (editingProperty) {
      // Prepare updated property
      const updatedProp: Property = {
        ...editingProperty,
        title,
        location,
        price: priceNum,
        priceFormatted: formattedPriceStr,
        areaSqft: areaNum,
        propertyType,
        bedrooms,
        bathrooms,
        parking,
        description,
        images: imagesList,
        video: videoUrl.trim() || undefined,
        agent: {
          ...editingProperty.agent,
          name: ownerName,
          phone: phoneNumber,
          whatsapp: `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`,
          sellerEmail: editingProperty.agent?.sellerEmail || userEmail || undefined
        }
      };
      
      if (onUpdateProperty) {
        onUpdateProperty(updatedProp);
      }
    } else {
      // Create new property
      const agentObj: PropertyAgent = {
        name: ownerName,
        title: 'Property Owner (Direct Listing)',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        phone: phoneNumber,
        whatsapp: `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`,
        sellerEmail: userEmail || undefined
      };

      const newProp: Property = {
        id: String(Date.now()),
        title,
        location,
        price: priceNum,
        currency: 'INR',
        priceFormatted: formattedPriceStr,
        areaSqft: areaNum,
        propertyType,
        listingStatus: 'New Launch',
        bedrooms,
        bathrooms,
        parking,
        isFeatured: false,
        isVerified: false,
        isNewListing: true,
        isFurnished: false,
        isGatedCommunity: true,
        amenities: ['Gym', '24/7 Security', 'Gated Community'],
        description,
        images: imagesList,
        video: videoUrl.trim() || undefined,
        agent: agentObj,
        nearby: [
          { category: 'Schools', name: 'Nearby Primary School', distance: '1.2 km' },
          { category: 'Hospitals', name: 'Community Care Center', distance: '1.8 km' }
        ]
      };

      onAddProperty(newProp);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 text-brand-on-surface">
        <div className="w-20 h-20 bg-brand-secondary/15 rounded-full flex items-center justify-center mx-auto text-brand-secondary shadow-xs">
          <Check className="w-10 h-10 stroke-[3] animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-extrabold">Property Submitted!</h1>
          <p className="text-xs sm:text-sm text-brand-on-surface-variant leading-relaxed max-w-xs mx-auto">
            Your property has been successfully indexed in our global real estate database and is now live for browsing.
          </p>
        </div>
        <button
          onClick={() => {
            if (setEditingProperty) {
              setEditingProperty(null);
            }
            setScreen('listings');
          }}
          className="px-6 py-3 bg-brand-primary text-white hover:bg-black text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
        >
          View Listings Market
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-(--size-container-max) mx-auto px-4 sm:px-6 lg:px-8 py-10 text-brand-on-surface">
      
      {/* Page headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-6 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-brand-secondary" />
            <span>{editingProperty ? 'Edit Property Details' : 'Upload New Property'}</span>
          </h1>
          <p className="text-sm text-brand-on-surface-variant mt-1 font-light">
            {editingProperty ? 'Modify the fields below to update this listing in the marketplace.' : 'Fill in the details below to list your property on our global marketplace.'}
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-brand-surface-container-low px-3 py-1.5 rounded-full self-start">
          ⓘ Fields marked with * are required
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main layout columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input forms (span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Property details Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base border-b border-gray-100 pb-2.5">Property Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Property Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Minimalist Villa with Ocean View"
                  className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                />
              </div>

              {/* Price, Area, Location grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 12500000"
                    className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Area (sqft) *</label>
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>
              </div>

              {/* Type & Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Prahlad Nagar, Ahmedabad"
                    className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Property Type *</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Independent Villa">Independent Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Flat">Flat</option>
                    <option value="Bungalow">Bungalow</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe the key features, amenities, and selling points of the property..."
                  className="w-full px-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary resize-y"
                />
              </div>

            </div>
          </div>

          {/* Media gallery Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base border-b border-gray-100 pb-2.5">Media Gallery</h3>
            
            <div className="space-y-4">
              {/* Images container */}
              <div 
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                className="border-2 border-dashed border-gray-200 hover:border-brand-secondary p-8 rounded-xl text-center cursor-pointer transition-colors space-y-3 bg-brand-surface"
              >
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUploadSim}
                  className="hidden"
                />
                <div className="p-3 bg-white rounded-full w-fit mx-auto text-gray-400 shadow-2xs">
                  <Upload className="w-5 h-5 text-brand-secondary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-on-surface">Drag & Drop Images</p>
                  <p className="text-[10px] text-gray-400 mt-1">Min 1080p, up to 10 files (JPG, PNG)</p>
                </div>
              </div>

              {/* Uploaded images grid */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Uploaded Images ({uploadedImages.length})</p>
                  <div className="grid grid-cols-4 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-100 shadow-2xs bg-gray-50">
                        <img 
                          src={img} 
                          alt="Uploaded preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedImages(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white text-[10px] p-1 rounded-full cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Video Tour Link */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">YouTube Video Tour Link</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Provide a YouTube video link to show a video walkthrough player on the listing detail page.</p>
              </div>
            </div>
          </div>

          {/* External links Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base border-b border-gray-100 pb-2.5">External Links</h3>
            
            <div>
              <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Google Map Link</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Steppers specifications and contact info */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* Specifications numeric steppers box */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base border-b border-gray-100 pb-2.5">Specifications</h3>
            
            <div className="space-y-4">
              {/* Bedrooms stepper */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-brand-on-surface uppercase">Bedrooms</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">BHK configurations</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-display">{bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bathrooms stepper */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-brand-on-surface uppercase">Bathrooms</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Total bath facilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-display">{bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBathrooms(bathrooms + 1)}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Parking spaces stepper */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-brand-on-surface uppercase">Parking Spaces</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Covered garage spaces</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setParking(Math.max(0, parking - 1))}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-display">{parking}</span>
                  <button
                    type="button"
                    onClick={() => setParking(parking + 1)}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info Box */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-base border-b border-gray-100 pb-2.5">Contact Info</h3>
            
            <div className="space-y-4">
              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Owner Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action button card */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary hover:bg-black/95 text-white font-semibold py-3.5 text-xs rounded-xl transition-all shadow-md cursor-pointer text-center disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying & Uploading...' : 'Submit Property'}
            </button>
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              By submitting, you agree to Krishna Properties Terms of Service and Privacy Policy.
            </p>
          </div>

        </div>

      </form>

    </div>
  );
}
