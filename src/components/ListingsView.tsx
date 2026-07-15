import { useState, useMemo, MouseEvent } from 'react';
import { Search, Heart, Grid, Map, MapPin, ChevronDown, Check, Sliders, RefreshCw, Star, Info, ShieldCheck, Edit, Trash2, X } from 'lucide-react';
import { Property } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ListingsViewProps {
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload') => void;
  setSelectedPropertyId: (id: string) => void;
  searchFilters: any;
  setSearchFilters: (filters: any) => void;
  properties: Property[];
  isAdmin: boolean;
  onDeleteProperty: (id: string) => void;
  onEditProperty: (property: Property) => void;
}

export default function ListingsView({ 
  setScreen, 
  setSelectedPropertyId, 
  searchFilters, 
  setSearchFilters,
  properties,
  isAdmin,
  onDeleteProperty,
  onEditProperty
}: ListingsViewProps) {
  
  // Heart favorited states stored locally
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    '1': true,
    '2': false,
    '8': true
  });

  // Comparison States
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Custom Delete Confirm Dialog State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Sort state
  const [sortBy, setSortBy] = useState<'relevance' | 'priceLow' | 'priceHigh' | 'areaHigh'>('relevance');
  const [sortOpen, setSortOpen] = useState(false);

  // Active filter state variables
  const [areaSearch, setAreaSearch] = useState(searchFilters.locationQuery || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>(searchFilters.maxPrice ? String(searchFilters.maxPrice) : '');
  const [selectedBeds, setSelectedBeds] = useState<string | null>(null);
  
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    'Apartment': searchFilters.propertyType === 'Apartment',
    'Independent Villa': searchFilters.propertyType === 'Independent Villa',
    'Penthouse': searchFilters.propertyType === 'Penthouse',
    'Commercial': searchFilters.propertyType === 'Commercial',
    'Flat': searchFilters.propertyType === 'Flat',
    'Bungalow': searchFilters.propertyType === 'Bungalow',
  });

  const [selectedStatus, setSelectedStatus] = useState<string | null>(searchFilters.listingStatus || null);
  const [furnishedFilter, setFurnishedFilter] = useState(false);
  const [gatedFilter, setGatedFilter] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Toggle favorite
  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset all filters
  const handleResetAll = () => {
    setAreaSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBeds(null);
    setSelectedTypes({
      'Apartment': false,
      'Independent Villa': false,
      'Penthouse': false,
      'Commercial': false,
      'Flat': false,
      'Bungalow': false,
    });
    setSelectedStatus(null);
    setFurnishedFilter(false);
    setGatedFilter(false);
    setSearchFilters({});
    setCurrentPage(1);
  };

  // Apply filters trigger
  const handleApplyFilters = () => {
    setCurrentPage(1);
    // Filters are applied instantly as we use useMemo, but we can give feedback
  };

  // Filter and Sort computation
  const filteredAndSortedProperties = useMemo(() => {
    let results = [...properties];

    // Filter by Area Search (case-insensitive)
    if (areaSearch) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(areaSearch.toLowerCase()) || 
        p.title.toLowerCase().includes(areaSearch.toLowerCase())
      );
    }

    // Filter by Min Price
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        // Handle conversion for USD in standard terms
        results = results.filter(p => p.price >= min);
      }
    }

    // Filter by Max Price
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        results = results.filter(p => p.price <= max);
      }
    }

    // Filter by Bedrooms (Beds count)
    if (selectedBeds) {
      const bedsNum = selectedBeds === '5+' ? 5 : parseInt(selectedBeds);
      results = results.filter(p => {
        if (selectedBeds === '5+') {
          return p.bedrooms >= 5;
        }
        return p.bedrooms === bedsNum;
      });
    }

    // Filter by Property Type (if any checkbox is active)
    const activeTypes = Object.entries(selectedTypes)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (activeTypes.length > 0) {
      results = results.filter(p => activeTypes.includes(p.propertyType));
    }

    // Filter by Listing Status
    if (selectedStatus) {
      results = results.filter(p => p.listingStatus === selectedStatus);
    }

    // Filter by Furnished
    if (furnishedFilter) {
      results = results.filter(p => p.isFurnished);
    }

    // Filter by Gated Community
    if (gatedFilter) {
      results = results.filter(p => p.isGatedCommunity);
    }

    // Sort operations
    if (sortBy === 'priceLow') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'areaHigh') {
      results.sort((a, b) => b.areaSqft - a.areaSqft);
    }

    return results;
  }, [
    areaSearch, minPrice, maxPrice, selectedBeds, 
    selectedTypes, selectedStatus, furnishedFilter, gatedFilter, sortBy
  ]);

  // Handle clicking on property cards
  const handlePropertySelect = (id: string) => {
    setSelectedPropertyId(id);
    setScreen('detail');
  };

  return (
    <div className="max-w-(--size-container-max) mx-auto px-4 sm:px-6 lg:px-8 py-10 text-brand-on-surface">
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-brand-on-surface-variant mb-6 font-medium">
        <button onClick={() => setScreen('home')} className="hover:text-brand-secondary cursor-pointer">Home</button>
        <span>/</span>
        <span className="text-brand-on-surface font-semibold">Ahmedabad Properties</span>
      </nav>

      {/* Main Title & Grid/Map Mode toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Properties in Ahmedabad
          </h1>
          <p className="text-sm text-brand-on-surface-variant mt-1.5 font-light">
            Showing <span className="font-semibold text-brand-on-surface">{filteredAndSortedProperties.length}</span> luxury and affordable spaces
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Grid View button */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-on-surface hover:bg-gray-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'map'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-on-surface hover:bg-gray-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold cursor-pointer text-brand-on-surface hover:bg-gray-50 transition-colors"
            >
              <span>Sort by: <span className="text-brand-secondary uppercase">{sortBy === 'relevance' ? 'Relevance' : sortBy === 'priceLow' ? 'Price: Low to High' : sortBy === 'priceHigh' ? 'Price: High to Low' : 'Max Area'}</span></span>
              <ChevronDown className="w-3.5 h-3.5 text-brand-outline" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-1.5 z-40 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 text-xs">
                {[
                  { label: 'Relevance', value: 'relevance' as const },
                  { label: 'Price: Low to High', value: 'priceLow' as const },
                  { label: 'Price: High to Low', value: 'priceHigh' as const },
                  { label: 'Area: High to Low', value: 'areaHigh' as const }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setSortBy(item.value); setSortOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-surface-container transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {sortBy === item.value && <Check className="w-3.5 h-3.5 text-brand-secondary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS (Column 1) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-xs h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-secondary" />
              <h2 className="font-display font-bold text-base text-brand-on-surface">Filters</h2>
            </div>
            <button
              onClick={handleResetAll}
              className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Preferred Area search */}
          <div>
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Preferred Area</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Prahlad Nagar"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-secondary text-brand-on-surface"
              />
            </div>
          </div>

          {/* Price Range inputs */}
          <div>
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
              />
            </div>
          </div>

          {/* Bedrooms selectors */}
          <div>
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Bedrooms</label>
            <div className="grid grid-cols-5 gap-1.5">
              {['1', '2', '3', '4', '5+'].map((beds) => (
                <button
                  key={beds}
                  type="button"
                  onClick={() => setSelectedBeds(selectedBeds === beds ? null : beds)}
                  className={`py-2 text-xs font-bold rounded-md border transition-colors cursor-pointer text-center ${
                    selectedBeds === beds
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {beds}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type checkboxes */}
          <div>
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Property Type</label>
            <div className="space-y-2.5">
              {Object.keys(selectedTypes).map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-brand-on-surface hover:text-brand-secondary transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTypes[type]}
                    onChange={() => setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                    className="w-4 h-4 rounded-md border-gray-300 text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Listing Status options */}
          <div>
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Listing Status</label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: 'New Launch', value: 'New Launch' },
                { label: 'Ready to Move', value: 'Ready to Move' },
                { label: 'Resale', value: 'Resale' }
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(selectedStatus === status.value ? null : status.value)}
                  className={`w-full py-2.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    selectedStatus === status.value
                      ? 'bg-brand-secondary text-white border-brand-secondary shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-brand-on-surface'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* More Filters */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">More Filters</label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-brand-on-surface hover:text-brand-secondary transition-colors">
              <input
                type="checkbox"
                checked={furnishedFilter}
                onChange={() => setFurnishedFilter(!furnishedFilter)}
                className="w-4 h-4 rounded-md border-gray-300 text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
              <span>Furnished Only</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-brand-on-surface hover:text-brand-secondary transition-colors">
              <input
                type="checkbox"
                checked={gatedFilter}
                onChange={() => setGatedFilter(!gatedFilter)}
                className="w-4 h-4 rounded-md border-gray-300 text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
              <span>Gated Community</span>
            </label>
          </div>

          {/* Apply Filters */}
          <button
            onClick={handleApplyFilters}
            className="w-full bg-brand-primary text-white hover:bg-black/95 font-semibold py-3 text-xs rounded-lg transition-all shadow-md cursor-pointer text-center"
          >
            Apply Filters
          </button>
        </div>

        {/* PROPERTIES GRID (Columns 2,3,4) */}
        <div className="lg:col-span-3">
          
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              
              // GRID VIEW
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {filteredAndSortedProperties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 p-8 text-center space-y-4">
                    <div className="p-4 rounded-full bg-gray-50 text-gray-400">
                      <Sliders className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-brand-on-surface">No Properties Found</h3>
                      <p className="text-xs text-brand-on-surface-variant mt-1 max-w-sm">
                        No matches were found for your current search criteria. Try modifying your price ranges or location search query.
                      </p>
                    </div>
                    <button
                      onClick={handleResetAll}
                      className="px-4 py-2 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-black transition-colors shadow-xs cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAndSortedProperties.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.25 }}
                        className="group bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                        onClick={() => handlePropertySelect(p.id)}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            {p.isFeatured && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-black bg-[#FBBF24] rounded-full uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            {p.isVerified && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-brand-secondary rounded-full uppercase tracking-wider">
                                Verified
                              </span>
                            )}
                            {p.isNewListing && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-blue-600 rounded-full uppercase tracking-wider">
                                New Listing
                              </span>
                            )}
                          </div>                           {/* Heart favorite button */}
                          <button
                            onClick={(e) => toggleFavorite(p.id, e)}
                            className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/80 text-brand-on-surface hover:bg-white hover:text-red-500 transition-all z-10 shadow-xs cursor-pointer"
                          >
                            <Heart 
                              className={`w-3.5 h-3.5 ${favorites[p.id] ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} 
                            />
                          </button>

                          {/* Compare checkbox button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (compareIds.includes(p.id)) {
                                setCompareIds(compareIds.filter(id => id !== p.id));
                                showToast('Removed from comparison list.', 'info');
                              } else {
                                if (compareIds.length >= 3) {
                                  showToast('You can compare a maximum of 3 properties.', 'error');
                                  return;
                                }
                                setCompareIds([...compareIds, p.id]);
                                showToast('Added to comparison list!', 'success');
                              }
                            }}
                            className={`absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all z-20 shadow-xs cursor-pointer flex items-center gap-1 border ${
                              compareIds.includes(p.id)
                                ? 'bg-brand-secondary text-white border-brand-secondary'
                                : 'bg-white/90 text-brand-on-surface hover:bg-white border-gray-150'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${compareIds.includes(p.id) ? 'bg-white' : 'bg-gray-400'}`} />
                            <span>{compareIds.includes(p.id) ? 'Selected' : 'Compare'}</span>
                          </button>

                          {/* Admin Edit/Delete overlay */}
                          {isAdmin && (
                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditProperty(p);
                                }}
                                className="p-1.5 rounded-md backdrop-blur-md bg-white/95 text-brand-on-surface hover:bg-brand-secondary hover:text-white transition-all shadow-xs cursor-pointer flex items-center justify-center border border-gray-100"
                                title="Edit Property"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(p.id);
                                }}
                                className="p-1.5 rounded-md backdrop-blur-md bg-white/95 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xs cursor-pointer flex items-center justify-center border border-gray-100"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Property Specs Body */}
                        <div className="p-5 flex flex-col flex-grow">
                          
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-display font-bold text-base text-brand-on-surface group-hover:text-brand-secondary transition-colors line-clamp-1">
                                {p.title}
                              </h3>
                              <p className="flex items-center text-[11px] text-brand-on-surface-variant gap-1 mt-1 font-light">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">{p.location}</span>
                              </p>
                            </div>
                            
                            {/* Formatted Price */}
                            <span className="font-display text-lg font-extrabold text-brand-on-surface shrink-0">
                              {p.priceFormatted}
                            </span>
                          </div>

                          {/* Quick Specs Icons */}
                          <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-3 mt-4 text-xs text-brand-on-surface-variant text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-brand-on-surface text-[11px]">
                                {p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'Office'}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Beds</span>
                            </div>
                            <div className="flex flex-col items-center border-x border-gray-100">
                              <span className="font-medium text-brand-on-surface text-[11px]">
                                {p.propertyType === 'Commercial' ? 'High-rise' : p.amenities.includes('Private Pool') || p.amenities.includes('Swimming Pool') ? 'Private Pool' : `${p.bathrooms} Bath`}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Features</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-brand-on-surface text-[11px]">
                                {p.areaSqft} sq.ft
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Area</span>
                            </div>
                          </div>

                          {/* Listing Status and View Button footer */}
                          <div className="flex items-center justify-between mt-4 pt-1">
                            <span className="px-2.5 py-1 text-[10px] font-bold text-brand-on-surface bg-brand-surface-container rounded-md">
                              {p.listingStatus}
                            </span>
                            <button
                              onClick={() => handlePropertySelect(p.id)}
                              className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Details</span>
                              <span className="text-[10px]">▶</span>
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredAndSortedProperties.length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-brand-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold"
                    >
                      ◀
                    </button>
                    {[1, 2, 3, '...', 12].map((num, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof num === 'number' && setCurrentPage(num)}
                        className={`w-9 h-9 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          num === currentPage
                            ? 'bg-black text-white'
                            : 'bg-white border border-gray-200 text-brand-on-surface hover:bg-gray-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-brand-on-surface transition-all cursor-pointer text-xs font-bold"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              
              // MAP VIEW (Stylized blueprint structure overlay representing geographical positions)
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Simulated Map Container (Left columns) */}
                <div className="md:col-span-2 relative min-h-[500px] rounded-xl overflow-hidden bg-[#e0ecfc] border border-brand-surface-dim shadow-xs flex flex-col justify-between p-6">
                  {/* Grid layout decoration representing street blocks */}
                  <div className="absolute inset-0 z-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-40">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-white/60 flex items-center justify-center text-[10px] font-mono text-brand-secondary/35">
                        BLOCK {i+1}
                      </div>
                    ))}
                  </div>

                  {/* Header decoration */}
                  <div className="relative z-10 flex items-center justify-between bg-white/90 backdrop-blur-xs px-3.5 py-2.5 rounded-lg border border-white/20 shadow-xs max-w-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-secondary animate-pulse" />
                      <p className="text-[11px] font-extrabold text-brand-on-surface">Interactive Ahmedabad Blueprint</p>
                    </div>
                    <span className="text-[10px] font-bold text-brand-secondary bg-brand-surface-container-low px-2 py-0.5 rounded-full">GPS OK</span>
                  </div>

                  {/* Simulated property pin markers scattered around the canvas */}
                  <div className="absolute inset-0 z-10">
                    {filteredAndSortedProperties.map((p, idx) => {
                      // Deterministic coordinate plotting
                      const lefts = ['25%', '50%', '75%', '35%', '65%', '15%', '45%', '85%'];
                      const tops = ['30%', '40%', '60%', '20%', '80%', '50%', '70%', '15%'];
                      const left = lefts[idx % lefts.length];
                      const top = tops[idx % tops.length];
                      
                      return (
                        <div 
                          key={p.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin"
                          style={{ left, top }}
                          onClick={() => handlePropertySelect(p.id)}
                        >
                          <div className="flex flex-col items-center">
                            {/* Hover label */}
                            <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute bottom-full mb-1.5 bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-20 flex flex-col items-center">
                              <span>{p.title}</span>
                              <span className="text-brand-secondary">{p.priceFormatted}</span>
                            </div>
                            {/* Marker Icon */}
                            <div className="w-8 h-8 rounded-full bg-brand-secondary hover:bg-black text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-all border-2 border-white">
                              <MapPin className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer decoration */}
                  <div className="relative z-10 self-end text-[10px] bg-white/80 backdrop-blur-xs py-1 px-3.5 rounded-full border border-white/20 text-brand-on-surface-variant font-mono">
                    Lat: 23.0225° N, Lon: 72.5714° E • Ahmedabad Real Estate Grid
                  </div>
                </div>

                {/* Right columns listing summary for map context */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  <div className="bg-brand-surface-container-low p-4 rounded-xl border border-gray-100 text-xs text-brand-on-surface flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-secondary shrink-0" />
                    <p className="leading-relaxed">
                      Click pins on the Ahmedabad blueprint to instantly review complete, verified property sheets.
                    </p>
                  </div>

                  {filteredAndSortedProperties.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handlePropertySelect(p.id)}
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:border-brand-secondary transition-all cursor-pointer flex gap-4"
                    >
                      <img 
                        src={p.images[0]} 
                        alt={p.title} 
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-sm text-brand-on-surface truncate">{p.title}</h4>
                        <p className="text-[10px] text-brand-on-surface-variant truncate mt-0.5">{p.location}</p>
                        <p className="text-xs font-extrabold text-brand-secondary mt-1.5">{p.priceFormatted}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* FLOATING COMPARE BAR */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-black/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {compareIds.map(id => {
                  const prop = properties.find(p => p.id === id);
                  return prop ? (
                    <img
                      key={id}
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : null;
                })}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-surface-bright">Compare Properties</p>
                <p className="text-[9px] text-gray-300">{compareIds.length} of 3 selected</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1 uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setIsComparing(true)}
                className="bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-sm"
              >
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPARISON SLIDE SHEET MODAL */}
      <AnimatePresence>
        {isComparing && (
          <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-2xl p-6 md:p-8 shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh] text-brand-on-surface"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsComparing(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-brand-on-surface hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-6 bg-brand-secondary rounded-full" />
                  <h3 className="font-display font-black text-xl tracking-tight">Property Comparison</h3>
                </div>
                <p className="text-xs text-brand-on-surface-variant font-light mt-1">Side-by-side feature breakdown of your selected choices.</p>
              </div>

              {/* Table scroll box */}
              <div className="overflow-x-auto flex-grow pb-4">
                <table className="w-full min-w-[650px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-150">
                      <th className="py-3 px-4 text-left font-bold text-gray-400 uppercase tracking-widest w-1/4">Features</th>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <th key={id} className="py-3 px-4 text-left w-1/4">
                            <div className="space-y-2">
                              <img 
                                src={prop.images[0]} 
                                alt={prop.title} 
                                className="w-full h-24 object-cover rounded-xl border border-gray-100 shadow-2xs"
                                referrerPolicy="no-referrer"
                              />
                              <h4 className="font-display font-black text-xs text-brand-on-surface leading-tight line-clamp-1">{prop.title}</h4>
                            </div>
                          </th>
                        ) : null;
                      })}
                      {/* Pad empty columns if less than 3 */}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <th key={`empty-th-${i}`} className="py-3 px-4 text-left w-1/4 text-gray-300 font-light italic">
                          Select property to compare
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Price</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 font-extrabold text-sm text-brand-secondary">
                            {prop.priceFormatted}
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-price-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Location Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Location</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 text-brand-on-surface text-xs font-medium truncate max-w-[150px]">
                            {prop.location}
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-loc-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Sqft Area Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Super Area</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 text-brand-on-surface font-semibold">
                            {prop.areaSqft.toLocaleString()} sq.ft
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-area-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Bedrooms & Bathrooms Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Specifications</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 text-brand-on-surface font-medium">
                            {prop.bedrooms} BHK, {prop.bathrooms} Bath
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-specs-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Gated Gated & Furnished Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Structure</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 text-brand-on-surface font-light">
                            {prop.isGatedCommunity ? 'Gated Community' : 'Standard'} • {prop.isFurnished ? 'Furnished' : 'Semi-Furnished'}
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-struct-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Key Amenities Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-brand-on-surface-variant uppercase tracking-wider text-[10px]">Amenities</td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4 text-brand-on-surface">
                            <div className="flex flex-wrap gap-1">
                              {prop.amenities.slice(0, 3).map((am, idx) => (
                                <span key={idx} className="bg-brand-surface-container text-[9px] font-semibold px-2 py-0.5 rounded text-brand-on-surface-variant">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-amenities-${i}`} className="py-3 px-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Action buttons Row */}
                    <tr className="hover:bg-transparent">
                      <td className="py-3 px-4"></td>
                      {compareIds.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return prop ? (
                          <td key={id} className="py-3 px-4">
                            <button
                              onClick={() => {
                                setIsComparing(false);
                                handlePropertySelect(prop.id);
                              }}
                              className="w-full py-2 bg-brand-primary text-white hover:bg-black font-bold rounded-lg transition-colors cursor-pointer text-center text-[10px] uppercase tracking-wider"
                            >
                              View Details
                            </button>
                          </td>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                        <td key={`empty-action-${i}`} className="py-3 px-4"></td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (() => {
          const prop = properties.find(p => p.id === deleteConfirmId);
          return prop ? (
            <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-sm rounded-2xl p-6 md:p-8 text-center space-y-5 shadow-2xl border border-gray-150 text-brand-on-surface"
              >
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-base text-brand-on-surface">Permanently Delete Listing?</h3>
                  <p className="text-xs text-brand-on-surface-variant font-light leading-relaxed">
                    Are you sure you want to permanently remove <span className="font-semibold text-brand-on-surface">"{prop.title}"</span> from the database? This action is irreversible.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteProperty(prop.id);
                      setDeleteConfirmId(null);
                      showToast('Listing successfully deleted.', 'success');
                    }}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          ) : null;
        })()}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl border text-xs font-bold ${
              toast.type === 'success' 
                ? 'bg-brand-secondary text-white border-brand-secondary/25' 
                : toast.type === 'error'
                  ? 'bg-red-600 text-white border-red-600/25'
                  : 'bg-brand-primary text-white border-brand-primary/25'
            }`}
          >
            <span className="text-sm">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
