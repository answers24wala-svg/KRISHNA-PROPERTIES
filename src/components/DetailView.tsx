import { useState, FormEvent } from 'react';
import { 
  MapPin, Heart, Share2, Phone, Calendar, Dumbbell, Shield, HelpCircle, 
  Sparkles, Coffee, Car, Grid, CalendarDays, Calculator, ArrowLeft, Check, CheckCircle, X, RotateCw
} from 'lucide-react';
import { Property, NearbyPlace } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PropertyMap from './PropertyMap';

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface DetailViewProps {
  property: Property;
  onBack: () => void;
}

export default function DetailView({ property, onBack }: DetailViewProps) {
  const [activeTab, setActiveTab] = useState<'Schools' | 'Hospitals' | 'Malls'>('Schools');
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Simulated 3D Tour & Contact states
  const [vrTourOpen, setVrTourOpen] = useState(false);
  const [vrHeading, setVrHeading] = useState(0);
  const [callContactOpen, setCallContactOpen] = useState(false);
  const [loanSuccess, setLoanSuccess] = useState(false);

  // Modals / Overlays
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00 AM');
  
  const [calcOpen, setCalcOpen] = useState(false);
  const [loanTerm, setLoanTerm] = useState(20);
  const [downPayment, setDownPayment] = useState(Math.round(property.price * 0.2));
  const [interestRate, setInterestRate] = useState(8.5);

  const calculateMortgage = () => {
    const P = property.price - downPayment;
    const r = (interestRate / 100) / 12;
    const n = loanTerm * 12;
    if (r === 0) return P / n;
    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(monthly);
  };

  const formattedMonthly = () => {
    const amt = calculateMortgage();
    if (property.currency === 'USD') {
      return `$${amt.toLocaleString()}/mo`;
    } else {
      // INR lakhs/crores standard formatting for simple numeric monthly
      if (amt >= 100000) {
        return `₹${(amt / 100000).toFixed(2)} Lakh/mo`;
      }
      return `₹${amt.toLocaleString()}/mo`;
    }
  };

  // Select first image as main, next 4 as gallery (fallback if fewer than 5)
  const mainImage = property.images[0];
  const galleryImages = property.images.slice(1, 5);
  // Pad gallery images if property has fewer than 5 images
  const fallbacks = [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
  ];
  const paddedGallery = [...galleryImages];
  while (paddedGallery.length < 4) {
    paddedGallery.push(fallbacks[paddedGallery.length]);
  }

  // Derived price per square foot
  const pricePerSqft = Math.round(property.price / property.areaSqft);
  const formattedPricePerSqft = property.currency === 'USD' 
    ? `$${pricePerSqft.toLocaleString()}/sq.ft` 
    : `₹${pricePerSqft.toLocaleString()}/sq.ft`;

  // Get icons for specific amenities
  const getAmenityIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('gym')) return <Dumbbell className="w-4 h-4 text-brand-secondary" />;
    if (lowercase.includes('pool')) return <Coffee className="w-4 h-4 text-brand-secondary" />; // stylized
    if (lowercase.includes('security')) return <Shield className="w-4 h-4 text-brand-secondary" />;
    if (lowercase.includes('smart')) return <Sparkles className="w-4 h-4 text-brand-secondary" />;
    if (lowercase.includes('parking') || lowercase.includes('valet')) return <Car className="w-4 h-4 text-brand-secondary" />;
    return <CheckCircle className="w-4 h-4 text-brand-secondary" />;
  };

  const handleScheduleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (visitDate) {
      setScheduleSuccess(true);
      setTimeout(() => {
        setScheduleSuccess(false);
        setScheduleOpen(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-(--size-container-max) mx-auto px-4 sm:px-6 lg:px-8 py-10 text-brand-on-surface">
      
      {/* Back link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </button>

      {/* 1. IMAGES GALLERY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        {/* Left main large image */}
        <div className="lg:col-span-2 relative aspect-[16/10] w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-xs">
          <img 
            src={mainImage} 
            alt={property.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Play Video Tour Overlay button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-all">
            <button 
              onClick={() => setVrTourOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg text-xs font-bold uppercase tracking-wider text-brand-on-surface hover:scale-105 transition-all cursor-pointer border border-white/20"
            >
              <span className="w-3.5 h-3.5 bg-brand-secondary text-white rounded-full flex items-center justify-center text-[10px]">▶</span>
              <span>{property.video ? 'Play Video Tour' : 'Play 3D Virtual Tour'}</span>
            </button>
          </div>
        </div>

        {/* Right smaller previews grid */}
        <div className="hidden lg:grid grid-cols-2 gap-4 h-full content-stretch">
          {paddedGallery.map((img, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 shadow-2xs">
              <img 
                src={img} 
                alt={`Gallery detail ${i+1}`}
                className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. SPECIFICATION BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Property details, description, amenities, nearby places */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Header area */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {property.isVerified && (
                <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-brand-secondary rounded-full uppercase tracking-wider shadow-2xs">
                  Verified
                </span>
              )}
              {property.isFeatured && (
                <span className="px-3 py-1 text-[10px] font-extrabold text-black bg-[#FBBF24] rounded-full uppercase tracking-wider shadow-2xs">
                  Featured
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  {property.title}
                </h1>
                <div className="flex items-center text-sm text-brand-on-surface-variant gap-1.5 mt-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{property.location}</span>
                </div>
              </div>

              {/* Price block */}
              <div className="text-left sm:text-right shrink-0">
                <p className="font-display text-2xl sm:text-3xl font-black text-brand-secondary">
                  {property.priceFormatted}
                </p>
                <p className="text-[11px] text-brand-on-surface-variant font-mono mt-1 uppercase tracking-wider">
                  {formattedPricePerSqft} • {property.listingStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Core Specifications icons bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-2xs text-center">
            <div className="space-y-1 p-2">
              <span className="block text-lg font-display font-bold text-brand-on-surface">
                {property.bedrooms > 0 ? `${property.bedrooms}` : 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Bedrooms</span>
            </div>
            <div className="space-y-1 p-2 border-l sm:border-l border-gray-100">
              <span className="block text-lg font-display font-bold text-brand-on-surface">
                {property.bathrooms > 0 ? `${property.bathrooms}` : 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Bathrooms</span>
            </div>
            <div className="space-y-1 p-2 border-l border-gray-100">
              <span className="block text-lg font-display font-bold text-brand-on-surface">
                {property.areaSqft.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Sq. Ft.</span>
            </div>
            <div className="space-y-1 p-2 border-l border-gray-100">
              <span className="block text-lg font-display font-bold text-brand-on-surface">
                {property.parking}
              </span>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Parking Slots</span>
            </div>
          </div>

          {/* Description expanding box */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-extrabold text-brand-on-surface">Description</h3>
            <div className="text-sm sm:text-base text-brand-on-surface-variant leading-relaxed font-light space-y-4">
              <p className={descExpanded ? '' : 'line-clamp-4'}>
                {property.description}
              </p>
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-xs font-bold text-brand-secondary hover:underline cursor-pointer flex items-center gap-1 mt-1"
              >
                <span>{descExpanded ? 'Read Less ▲' : 'Read More ▼'}</span>
              </button>
            </div>
          </div>

          {/* Video Walkthrough Player */}
          {property.video && getYouTubeId(property.video) && (
            <div className="space-y-4 border-t border-gray-100 pt-8">
              <h3 className="font-display text-lg font-extrabold text-brand-on-surface">Video Walkthrough</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border border-gray-100 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(property.video)}?rel=0`}
                  title="YouTube Video Tour"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          <div className="space-y-4 border-t border-gray-100 pt-8">
            <h3 className="font-display text-lg font-extrabold text-brand-on-surface">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.amenities.map((amenity) => (
                <div 
                  key={amenity}
                  className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-lg shadow-2xs"
                >
                  <div className="p-1.5 rounded-md bg-brand-surface-container-low shrink-0">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-xs font-semibold text-brand-on-surface truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Nearby? Tabs */}
          <div className="space-y-6 border-t border-gray-100 pt-8">
            <PropertyMap property={property} />
            
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h4 className="font-display text-sm font-extrabold text-brand-on-surface uppercase tracking-wider">Nearby Directory</h4>
              
              {/* Tabs button row */}
              <div className="flex border-b border-gray-200 text-xs font-bold">
                {(['Schools', 'Hospitals', 'Malls'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-6 border-b-2 cursor-pointer transition-colors ${
                      activeTab === tab
                        ? 'border-brand-primary text-brand-on-surface'
                        : 'border-transparent text-brand-on-surface-variant hover:text-brand-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Places List filtered by active tab */}
              <div className="space-y-3.5 pt-2">
                {property.nearby.filter(n => n.category === activeTab).map((place, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-2xs animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-secondary" />
                      <span className="text-xs sm:text-sm font-semibold text-brand-on-surface">{place.name}</span>
                    </div>
                    <span className="text-xs font-bold text-brand-secondary bg-brand-surface-container-low px-3 py-1 rounded-full font-mono">
                      {place.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Agent Contact & Mortgage Calculator widget */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* Agent info details card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <img 
                src={property.agent.image} 
                alt={property.agent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-secondary shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-display font-bold text-base text-brand-on-surface">
                  {property.agent.name}
                </h4>
                <p className="text-xs text-brand-on-surface-variant mt-0.5">
                  {property.agent.title}
                </p>
              </div>
            </div>

            {/* Action buttons list */}
            <div className="space-y-3">
              <button 
                onClick={() => setCallContactOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-black/95 text-white font-semibold py-3 text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </button>

              <a 
                href={property.agent.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-3 text-xs rounded-lg transition-colors cursor-pointer text-center shadow-xs"
              >
                <span className="text-lg">💬</span>
                <span>WhatsApp Agent</span>
              </a>

              <button 
                onClick={() => setScheduleOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-brand-on-surface hover:bg-gray-50 font-semibold py-3 text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Visit</span>
              </button>
            </div>

            {/* Save & Share row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => {
                  const newSaved = !saved;
                  setSaved(newSaved);
                  showToast(newSaved ? 'Property added to your luxury portfolio!' : 'Property removed from portfolio.', 'info');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                  saved 
                    ? 'border-red-200 bg-red-50 text-red-600 font-bold'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-brand-on-surface'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-red-500 text-red-500 scale-105' : ''}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Brokerage share link copied to clipboard!', 'success');
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-brand-on-surface rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Mortgage Banner Calculator trigger */}
          <div 
            onClick={() => setCalcOpen(true)}
            className="bg-brand-primary-container text-white p-5 rounded-xl border border-brand-primary-container/20 cursor-pointer hover:bg-brand-primary-container/95 transition-all shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-brand-on-primary-container">Estimated Financing</p>
              <h4 className="font-display font-extrabold text-sm flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-secondary" />
                <span>Get Mortgage Help</span>
              </h4>
              <p className="text-xs text-brand-on-primary-container font-medium mt-1">Starting from {formattedMonthly()}</p>
            </div>
            <span className="text-lg text-brand-secondary">▶</span>
          </div>

        </div>

      </div>

      {/* SCHEDULE VISIT MODAL */}
      <AnimatePresence>
        {scheduleOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl relative border border-gray-100 text-brand-on-surface"
            >
              <button 
                onClick={() => setScheduleOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-brand-on-surface cursor-pointer rounded-full hover:bg-gray-100"
              >
                ✕
              </button>

              {scheduleSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-brand-secondary/15 rounded-full flex items-center justify-center mx-auto text-brand-secondary">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Visit Scheduled!</h3>
                    <p className="text-xs text-brand-on-surface-variant mt-1.5">
                      Your appointment for {visitDate} at {visitTime} has been registered. {property.agent.name} will contact you shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-5 h-5 text-brand-secondary" />
                    <h3 className="font-display font-extrabold text-base">Schedule In-Person Visit</h3>
                  </div>
                  
                  <p className="text-xs text-brand-on-surface-variant leading-relaxed mb-4 font-light">
                    Select your preferred date and session to inspect the majestic <span className="font-semibold text-brand-on-surface">{property.title}</span>.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Select Date</label>
                      <input 
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Preferred Time</label>
                      <select 
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-brand-surface border border-gray-200 rounded-md text-xs text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                      >
                        <option>10:00 AM</option>
                        <option>11:30 AM</option>
                        <option>01:00 PM</option>
                        <option>03:30 PM</option>
                        <option>05:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-brand-primary text-white hover:bg-black font-semibold py-3 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Schedule Booking
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MORTGAGE CALCULATOR MODAL */}
      <AnimatePresence>
        {calcOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl relative border border-gray-100 text-brand-on-surface space-y-6"
            >
              <button 
                onClick={() => setCalcOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-brand-on-surface cursor-pointer rounded-full hover:bg-gray-100"
              >
                ✕
              </button>

              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-secondary" />
                <h3 className="font-display font-extrabold text-base">Mortgage Estimator</h3>
              </div>

              {loanSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                    <CheckCircle className="w-10 h-10 animate-bounce text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-base text-brand-on-surface">Application Submitted!</h4>
                    <p className="text-xs text-brand-on-surface-variant font-light max-w-xs mx-auto mt-1.5 leading-relaxed">
                      Our premium mortgage officers at HDFC & ICICI have been dispatched to analyze your criteria and draft customized luxury term sheets.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLoanSuccess(false);
                      setCalcOpen(false);
                    }}
                    className="mt-2 px-6 py-2.5 bg-brand-primary hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-brand-surface-container-low rounded-xl text-center">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-on-primary-container block">Monthly Installment</span>
                    <span className="text-3xl font-display font-black text-brand-secondary block mt-1.5">{formattedMonthly()}</span>
                  </div>

                  <div className="space-y-4">
                    {/* Down payment slider */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-brand-on-surface-variant">Down Payment</span>
                        <span className="text-brand-on-surface">{property.currency === 'USD' ? `$${downPayment.toLocaleString()}` : `₹${downPayment.toLocaleString()}`}</span>
                      </div>
                      <input 
                        type="range"
                        min={Math.round(property.price * 0.1)}
                        max={Math.round(property.price * 0.8)}
                        step={Math.round(property.price * 0.05)}
                        value={downPayment}
                        onChange={(e) => setDownPayment(parseInt(e.target.value))}
                        className="w-full accent-brand-secondary h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-400">Min 10% - Max 80%</span>
                    </div>

                    {/* Interest Rate slider */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-brand-on-surface-variant">Interest Rate</span>
                        <span className="text-brand-on-surface">{interestRate}%</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full accent-brand-secondary h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Term Select */}
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1.5">Loan Term (Years)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 20, 30].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setLoanTerm(term)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                              loanTerm === term
                                ? 'bg-black text-white border-black'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {term} Years
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setLoanSuccess(true)}
                    className="w-full bg-brand-primary text-white hover:bg-black font-semibold py-3 text-xs rounded-lg transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Apply for Loan Assistance
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIRTUAL REALITY (VR) 3D INTERACTIVE PANORAMIC TOUR MODAL */}
      <AnimatePresence>
        {vrTourOpen && (
          <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 text-white overflow-hidden">
            
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between z-20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold">VR Stream Active</span>
                </div>
                <h4 className="font-display font-black text-sm uppercase tracking-tight">{property.title} — 3D Portal</h4>
              </div>
              
              <button 
                onClick={() => setVrTourOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Stream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immersive Viewport Stage */}
            <div className="relative flex-grow my-4 flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 bg-gray-950">
              {property.video && getYouTubeId(property.video) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(property.video)}?autoplay=1&rel=0`}
                  title="YouTube Video Tour"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full z-10 rounded-xl"
                ></iframe>
              ) : (
                /* Gyroscopic Panoramic Image */
                <motion.div 
                  animate={{ 
                    scale: [1.08, 1.15, 1.08],
                    x: [vrHeading - 20, vrHeading + 20, vrHeading - 20],
                    y: [-10, 10, -10]
                  }}
                  transition={{ 
                    duration: 25, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img 
                    src={property.images[0]} 
                    alt="3D Tour" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}

              {/* High-Tech Telemetry Compass overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* SVG Target Crosshair */}
                <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full border border-dashed border-white/20" />
                  <div className="absolute left-0 right-0 h-[1px] bg-white/25" />
                  <div className="absolute top-0 bottom-0 w-[1px] bg-white/25" />
                  <span className="absolute text-[8px] font-mono text-gray-400 top-2">000° N</span>
                  <span className="absolute text-[8px] font-mono text-gray-400 bottom-2">180° S</span>
                  <span className="absolute text-[8px] font-mono text-gray-400 left-2">270° W</span>
                  <span className="absolute text-[8px] font-mono text-gray-400 right-2">090° E</span>
                </div>
              </div>

              {/* Ambient HUD Readings */}
              <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 space-y-1 text-[9px] font-mono">
                <p className="text-gray-400">BLUEPRINT STREAM: ONLINE</p>
                <p className="text-brand-surface-bright">PITCH/YAW YV: {Math.round(vrHeading)}° • {Math.round(vrHeading + 45)}°</p>
                <p className="text-gray-400">CAMERA GYRO: STABLE (60FPS)</p>
                <p className="text-gray-400">SECTOR: AHMEDABAD CENTRAL</p>
              </div>

              {/* Ambient Navigation hotlinks */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                {['Master Suite', 'Gourmet Kitchen', 'Alfresco Patio'].map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setVrHeading(prev => prev + 60 * (idx + 1));
                      showToast(`Navigated portal viewpoint to: ${loc}`, 'success');
                    }}
                    className="px-3 py-1.5 bg-black/70 backdrop-blur-md hover:bg-black border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ✦ {loc}
                  </button>
                ))}
              </div>

              {/* Viewport Panning Controls */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setVrHeading(prev => prev - 30)}
                  className="px-3 py-1.5 hover:bg-white/10 text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  ◀ PAN L
                </button>
                <button
                  onClick={() => setVrHeading(0)}
                  className="p-1.5 hover:bg-white/10 rounded cursor-pointer transition-colors"
                  title="Recenter"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setVrHeading(prev => prev + 30)}
                  className="px-3 py-1.5 hover:bg-white/10 text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  PAN R ▶
                </button>
              </div>

            </div>

            {/* Bottom Info bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-gray-400 z-10 gap-3 border-t border-white/10 pt-4">
              <p className="font-light">Swipe, rotate, or use the panel controls to scan different sectors. Press ESC or click "✕" to quit.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono">VR MODE ACTIVE</span>
                <span className="px-2 py-0.5 rounded bg-brand-secondary text-white text-[9px] font-mono">1080P COMPRESSED</span>
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* LUXURY AGENT PROXY VOICE DIALER */}
      <AnimatePresence>
        {callContactOpen && (
          <div className="fixed inset-0 z-100 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-sm rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative"
            >
              
              {/* Dialing concentric signal wave */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-brand-secondary/15 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-brand-secondary/20 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-brand-secondary text-white flex items-center justify-center shadow-lg relative z-10">
                  <Phone className="w-8 h-8 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-primary font-bold px-2 py-0.5 rounded bg-brand-primary/10">DIALING VOICE PROXY</span>
                <h4 className="font-display font-black text-lg tracking-tight">{property.agent.name}</h4>
                <p className="text-xs text-zinc-400 font-light">{property.agent.title}</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1.5 text-[10px] font-mono text-zinc-400 text-left">
                <p className="flex justify-between"><span>PROXY STATION:</span> <span className="text-brand-primary font-bold">ONLINE</span></p>
                <p className="flex justify-between"><span>VOICE ROUTING:</span> <span className="text-white">SECURE LANDLINE</span></p>
                <p className="flex justify-between"><span>TELEPHONE:</span> <span className="text-white">{property.agent.phone}</span></p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCallContactOpen(false);
                    showToast('Voice Proxy call terminated safely.', 'info');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  End Voice Link
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED TOAST OVERLAY */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-100 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl border text-xs font-bold ${
              toast.type === 'success' 
                ? 'bg-brand-primary text-white border-brand-primary/25' 
                : toast.type === 'error'
                  ? 'bg-red-600 text-white border-red-600/25'
                  : 'bg-brand-secondary text-white border-brand-secondary/25'
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
