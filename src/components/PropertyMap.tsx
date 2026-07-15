import { useState } from 'react';
import { MapPin, School, Landmark, Building, Info, Settings, HelpCircle } from 'lucide-react';
import { Property } from '../types';

// Conditionally load Google Maps components to avoid issues if key isn't loaded
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

// Map neighborhood names to realistic lat/lng coordinates in Ahmedabad and Manhattan
export function getPropertyCoords(location: string) {
  const loc = location.toLowerCase();
  if (loc.includes('prahlad nagar')) {
    return { lat: 23.0120, lng: 72.5090 };
  } else if (loc.includes('south bopal')) {
    return { lat: 23.0180, lng: 72.4690 };
  } else if (loc.includes('sindhu bhavan')) {
    return { lat: 23.0390, lng: 72.5080 };
  } else if (loc.includes('jagatpur')) {
    return { lat: 23.1110, lng: 72.5600 };
  } else if (loc.includes('bopal')) {
    return { lat: 23.0310, lng: 72.4820 };
  } else if (loc.includes('s.g. highway')) {
    return { lat: 23.0240, lng: 72.5010 };
  } else if (loc.includes('manhattan') || loc.includes('ny')) {
    return { lat: 40.7736, lng: -73.9566 };
  }
  return { lat: 23.0225, lng: 72.5714 }; // Default Ahmedabad Center
}

interface PropertyMapProps {
  property: Property;
}

export default function PropertyMap({ property }: PropertyMapProps) {
  const center = getPropertyCoords(property.location);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);

  // Generate localized simulated points of interest relative to the center
  const nearbyPois = property.nearby.map((poi, idx) => {
    // Offset coordinates slightly to scatter them around the center
    const angle = (idx * 360) / property.nearby.length;
    const distanceOffset = 0.004 + (idx * 0.001); // degrees offset
    const rad = (angle * Math.PI) / 180;
    
    return {
      ...poi,
      id: `${poi.category}-${idx}`,
      lat: center.lat + Math.sin(rad) * distanceOffset,
      lng: center.lng + Math.cos(rad) * distanceOffset,
    };
  });

  const getPoiIcon = (category: string) => {
    switch (category) {
      case 'Schools':
        return <School className="w-3.5 h-3.5" />;
      case 'Hospitals':
        return <Landmark className="w-3.5 h-3.5" />;
      default:
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  const getPoiColor = (category: string) => {
    switch (category) {
      case 'Schools':
        return 'bg-blue-500 text-white';
      case 'Hospitals':
        return 'bg-red-500 text-white';
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-extrabold text-brand-on-surface">Property Location</h3>
          <p className="text-xs text-brand-on-surface-variant font-light mt-0.5">{property.location}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-surface-container-low px-2.5 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold text-brand-on-surface-variant">
          <span className={`w-1.5 h-1.5 rounded-full ${hasValidKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>{hasValidKey ? 'Google Maps Live' : 'Interactive Map Simulator'}</span>
        </div>
      </div>

      {hasValidKey ? (
        <div className="relative w-full h-[320px] rounded-xl overflow-hidden shadow-xs border border-gray-200">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={center}
              defaultZoom={14}
              mapId="CRISP_LIGHT_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={true}
              zoomControl={true}
            >
              {/* Main property marker */}
              <AdvancedMarker position={center} title={property.title}>
                <Pin background="#000000" glyphColor="#ffffff" borderColor="#000000" scale={1.1} />
              </AdvancedMarker>

              {/* Nearby place markers */}
              {nearbyPois.map((poi) => (
                <AdvancedMarker 
                  key={poi.id} 
                  position={{ lat: poi.lat, lng: poi.lng }}
                  title={poi.name}
                >
                  <div className={`p-1.5 rounded-full shadow-md border border-white flex items-center justify-center ${getPoiColor(poi.category)}`}>
                    {getPoiIcon(poi.category)}
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>
      ) : (
        /* INTERACTIVE MAP SIMULATOR */
        <div className="relative w-full h-[350px] bg-slate-50 rounded-xl overflow-hidden border border-gray-200 shadow-xs flex flex-col justify-between font-sans">
          
          {/* Simulated Map Graphic Grid */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Simulated roads / landscape lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="absolute top-1/4 left-0 right-0 h-4 bg-gray-500 transform -rotate-6" />
            <div className="absolute top-2/3 left-0 right-0 h-3 bg-gray-500 transform rotate-12" />
            <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-500 transform rotate-45" />
            <div className="absolute top-0 bottom-0 left-2/3 w-3 bg-gray-500 transform -rotate-12" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full border-8 border-gray-500" />
          </div>

          {/* SIMULATED POIS */}
          <div className="absolute inset-0">
            {/* Center property marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              {/* Radar waves */}
              <span className="absolute w-12 h-12 bg-black/10 rounded-full animate-ping pointer-events-none" />
              <span className="absolute w-24 h-24 bg-black/5 rounded-full animate-pulse pointer-events-none" />
              
              <div className="bg-black text-white p-2.5 rounded-xl shadow-lg border border-black flex items-center justify-center gap-1.5 cursor-pointer">
                <MapPin className="w-4 h-4 text-brand-secondary fill-brand-secondary" />
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{property.propertyType}</span>
              </div>
              <div className="bg-white/95 backdrop-blur-xs text-black border border-gray-100 text-[10px] px-2.5 py-1 rounded-md shadow-md mt-1.5 font-bold tracking-tight text-center">
                {property.title}
              </div>
            </div>

            {/* Scatting POIs */}
            {nearbyPois.map((poi, idx) => {
              // Map coordinates to percentage positions
              const angle = (idx * 360) / property.nearby.length;
              const rad = (angle * Math.PI) / 180;
              const distance = 90 + (idx * 15); // pixels
              const leftOffset = 50 + (Math.cos(rad) * distance * 0.25); // percentage
              const topOffset = 50 + (Math.sin(rad) * distance * 0.22); // percentage

              const isSelected = selectedPoi === poi.id;

              return (
                <button
                  key={poi.id}
                  onClick={() => setSelectedPoi(isSelected ? null : poi.id)}
                  style={{ left: `${leftOffset}%`, top: `${topOffset}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-transform hover:scale-110 cursor-pointer"
                >
                  <div className={`p-1.5 rounded-full shadow-md border-2 border-white flex items-center justify-center transition-colors ${
                    isSelected ? 'ring-2 ring-black bg-black text-white scale-110' : getPoiColor(poi.category)
                  }`}>
                    {getPoiIcon(poi.category)}
                  </div>
                  {isSelected && (
                    <div className="absolute top-8 bg-black text-white text-[9px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap font-bold">
                      {poi.name} ({poi.distance})
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Top Panel Setup prompt */}
          <div className="relative m-3 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-gray-200/80 shadow-md flex items-start gap-2.5 z-30">
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600 shrink-0">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <span className="block text-[11px] font-extrabold text-brand-on-surface tracking-tight">
                💡 Live Google Map integration configured!
              </span>
              <p className="text-[10px] text-brand-on-surface-variant font-light leading-relaxed">
                Add your <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> in <strong>Settings</strong> (⚙️ top-right) → <strong>Secrets</strong> to activate street navigation, live search, and real coordinates instantly.
              </p>
            </div>
          </div>

          {/* Bottom Controls Info */}
          <div className="relative m-3 bg-black/90 backdrop-blur-md text-white p-3 rounded-lg flex items-center justify-between z-30 shadow-md">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-[10px] font-semibold text-gray-200">Click neighboring markers to check local amenities</span>
            </div>
            {selectedPoi && (
              <button 
                onClick={() => setSelectedPoi(null)}
                className="text-[9px] font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
