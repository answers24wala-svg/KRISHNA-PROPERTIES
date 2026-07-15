import { useState } from 'react';
import { Search, MapPin, Building, CreditCard, ChevronDown, Check, ArrowRight, ShieldCheck, HelpCircle, Compass } from 'lucide-react';
import { Property, INITIAL_PROPERTIES } from '../types';
import { motion } from 'motion/react';

interface HomeViewProps {
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload') => void;
  setSelectedPropertyId: (id: string) => void;
  onSearch: (filters: any) => void;
  properties: Property[];
}

export default function HomeView({ setScreen, setSelectedPropertyId, onSearch, properties }: HomeViewProps) {
  // Dropdown states
  const [location, setLocation] = useState('All Ahmedabad');
  const [propertyType, setPropertyType] = useState('Any Type');
  const [budget, setBudget] = useState('');

  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Get first 3 properties for featured
  const featuredProperties = properties.slice(0, 3);

  const handleSearchSubmit = () => {
    const searchFilters: any = {};
    if (location !== 'All Ahmedabad') searchFilters.locationQuery = location;
    if (propertyType !== 'Any Type') searchFilters.propertyType = propertyType;
    if (budget.trim() !== '') {
      const budgetVal = parseFloat(budget);
      if (!isNaN(budgetVal) && budgetVal > 0) {
        searchFilters.maxPrice = budgetVal;
      }
    }
    onSearch(searchFilters);
    setScreen('listings');
  };

  const handleCardClick = (id: string) => {
    setSelectedPropertyId(id);
    setScreen('detail');
  };

  return (
    <div className="bg-brand-surface text-brand-on-surface">
      
      {/* 1. Hero Section with modern dark-overlay architectural background */}
      <section className="relative min-h-[600px] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gray-400">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero background" 
            className="w-full h-full object-cover filter brightness-[0.45]"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            Find Your Dream Property
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-sans font-light leading-relaxed"
          >
            Discover exclusive residential and commercial spaces in Ahmedabad's most sought-after neighborhoods.
          </motion.p>

          {/* Search form box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full mt-10 p-4 sm:p-6 bg-white rounded-xl shadow-xl border border-gray-100 text-left grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            {/* Location Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant mb-2">Location</label>
              <button
                type="button"
                onClick={() => { setLocationOpen(!locationOpen); setTypeOpen(false); setBudgetOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-brand-on-surface bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="truncate font-medium">{location}</span>
                <ChevronDown className="w-4 h-4 text-brand-outline" />
              </button>
              {locationOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-100 rounded-lg shadow-lg py-1.5 text-sm">
                  {['All Ahmedabad', 'Prahlad Nagar', 'South Bopal', 'Satellite', 'Bodakdev', 'Sindhu Bhavan'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocation(loc); setLocationOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-brand-surface-container transition-colors cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant mb-2">Property Type</label>
              <button
                type="button"
                onClick={() => { setTypeOpen(!typeOpen); setLocationOpen(false); setBudgetOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-brand-on-surface bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="truncate font-medium">{propertyType}</span>
                <ChevronDown className="w-4 h-4 text-brand-outline" />
              </button>
              {typeOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-100 rounded-lg shadow-lg py-1.5 text-sm">
                  {['Any Type', 'Apartment', 'Independent Villa', 'Penthouse', 'Commercial', 'Flat', 'Bungalow'].map((type) => (
                    <button
                      key={type}
                      onClick={() => { setPropertyType(type); setTypeOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-brand-surface-container transition-colors cursor-pointer"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Input */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant mb-2">Max Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 10000000 (1 Cr)"
                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-brand-on-surface bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-brand-secondary transition-all"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchSubmit}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px] cursor-pointer"
            >
              <Search className="w-4 h-4 text-brand-on-secondary" />
              <span>Search</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Properties Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-(--size-container-max) mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Premium Collection</span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-on-surface mt-1">
              Featured Properties
            </h2>
            <p className="text-brand-on-surface-variant text-sm mt-2 max-w-xl">
              Handpicked listings from premium localities in Ahmedabad.
            </p>
          </div>
          <button 
            onClick={() => { onSearch({}); setScreen('listings'); }}
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary group mt-4 sm:mt-0 cursor-pointer hover:text-brand-secondary transition-colors"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Featured Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProperties.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full cursor-pointer"
              onClick={() => handleCardClick(p.id)}
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Custom Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                {/* Price Display */}
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-2xl font-display font-extrabold">{p.priceFormatted}</span>
                </div>

                {/* Badges container */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {p.isFeatured && (
                    <span className="px-3 py-1 text-[10px] font-bold text-black bg-[#FBBF24] rounded-full uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  )}
                  {p.isVerified && (
                    <span className="px-3 py-1 text-[10px] font-bold text-white bg-brand-secondary rounded-full uppercase tracking-wider shadow-sm">
                      Verified
                    </span>
                  )}
                  {p.isNewListing && (
                    <span className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 rounded-full uppercase tracking-wider shadow-sm">
                      New Listing
                    </span>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-display text-lg font-bold text-brand-on-surface group-hover:text-brand-secondary transition-colors line-clamp-1">
                  {p.title}
                </h3>
                <div className="flex items-center text-brand-on-surface-variant text-xs gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{p.location}</span>
                </div>

                {/* Card Specs Footer */}
                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-6 text-xs text-brand-on-surface-variant text-center">
                  <div className="space-y-1">
                    <span className="block font-medium text-brand-on-surface">
                      {p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'Office'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Type</span>
                  </div>
                  <div className="space-y-1 border-x border-gray-100">
                    <span className="block font-medium text-brand-on-surface">
                      {p.propertyType === 'Commercial' ? 'Commercial' : p.amenities.includes('Private Pool') || p.amenities.includes('Swimming Pool') ? 'Pool / Acc' : `${p.bathrooms} Bath`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Features</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-medium text-brand-on-surface">{p.areaSqft} sq.ft</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Area</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Why Choose Krishna Properties? Section */}
      <section id="why-choose" className="py-24 bg-brand-surface-container-low border-y border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-(--size-container-max) mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Block */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Market Leaders</span>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-brand-on-surface leading-tight">
                Why Choose Krishna Properties?
              </h2>
              <p className="text-brand-on-surface-variant text-sm sm:text-base leading-relaxed font-light">
                With over a decade of expertise in the Ahmedabad real estate market, we bridge the gap between your aspirations and the perfect property. Our commitment to transparency and premium service ensures a stress-free property hunting experience.
              </p>
            </div>

            {/* List entries */}
            <div className="space-y-6">
              
              {/* Entry 1 */}
              <div className="flex gap-4">
                <div className="flex-none w-12 h-12 rounded-xl bg-brand-surface-container-highest flex items-center justify-center text-brand-secondary shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-on-surface text-base">Verified Listings</h4>
                  <p className="text-xs sm:text-sm text-brand-on-surface-variant mt-1 leading-relaxed">
                    Every property on our portal is physically verified by our property experts to guarantee accuracy and safety.
                  </p>
                </div>
              </div>

              {/* Entry 2 */}
              <div className="flex gap-4">
                <div className="flex-none w-12 h-12 rounded-xl bg-brand-surface-container-highest flex items-center justify-center text-brand-tertiary shadow-xs">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-on-surface text-base">Expert Advice</h4>
                  <p className="text-xs sm:text-sm text-brand-on-surface-variant mt-1 leading-relaxed">
                    Receive expert legal advice, financial evaluation assistance, and seamless documentation support throughout.
                  </p>
                </div>
              </div>

              {/* Entry 3 */}
              <div className="flex gap-4">
                <div className="flex-none w-12 h-12 rounded-xl bg-brand-surface-container-highest flex items-center justify-center text-blue-600 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-on-surface text-base">Local Presence</h4>
                  <p className="text-xs sm:text-sm text-brand-on-surface-variant mt-1 leading-relaxed">
                    Deep localized insights into Ahmedabad's fastest growing zones like S.G. Highway, South Bopal, and Bodakdev.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Image/Mockup Block */}
          <div className="relative">
            <div className="absolute inset-0 bg-brand-secondary/10 rounded-2xl blur-xl transform translate-x-4 translate-y-4" />
            <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80" 
                alt="Architecture design" 
                className="w-full h-full object-cover filter brightness-[0.95]"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating review badge */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 flex items-center gap-3.5 max-w-[280px]">
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                  ★
                </div>
                <div>
                  <p className="text-xs font-extrabold text-brand-on-surface">Trusted by 10k+ Families</p>
                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5">Top-rated brokerage in Gujarat</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
