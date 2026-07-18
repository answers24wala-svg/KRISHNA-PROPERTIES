import { useMemo } from 'react';
import { Building, IndianRupee, Users, PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Property } from '../types';

interface AdminDashboardProps {
  properties: Property[];
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard') => void;
}

export default function AdminDashboard({
  properties,
  onEditProperty,
  onDeleteProperty,
  setScreen
}: AdminDashboardProps) {

  // 1. Compute Stats
  const stats = useMemo(() => {
    const totalListings = properties.length;
    const totalValue = properties.reduce((acc, p) => acc + p.price, 0);
    
    const adminListings = properties.filter(
      p => !p.agent?.sellerEmail || p.agent.sellerEmail.toLowerCase() === 'gopalnaidu085@gmail.com'
    ).length;
    
    const sellerListings = totalListings - adminListings;

    // Format Indian Rupees nicely (e.g. 25.40 Cr or 50.00 Lakh)
    let totalValueFormatted = '₹0';
    if (totalValue >= 10000000) {
      totalValueFormatted = `₹${(totalValue / 10000000).toFixed(2)} Cr`;
    } else if (totalValue >= 100000) {
      totalValueFormatted = `₹${(totalValue / 100000).toFixed(2)} Lakh`;
    } else {
      totalValueFormatted = `₹${totalValue.toLocaleString()}`;
    }

    // Group listings by seller email
    const sellerGroups: Record<string, number> = {};
    properties.forEach(p => {
      const email = p.agent?.sellerEmail || 'Admin';
      sellerGroups[email] = (sellerGroups[email] || 0) + 1;
    });

    return {
      totalListings,
      totalValueFormatted,
      adminListings,
      sellerListings,
      sellerGroups: Object.entries(sellerGroups).map(([email, count]) => ({ email, count }))
    };
  }, [properties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-brand-on-surface">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-secondary hover:underline cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-brand-on-surface-variant font-light mt-1">
            Analyze property metrics, monitor seller uploads, and manage database listings.
          </p>
        </div>
        <button
          onClick={() => setScreen('upload')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary hover:bg-black/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Listings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300">
          <div className="p-4 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Building className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-2xl font-black font-display leading-tight">{stats.totalListings}</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Total Listings</span>
          </div>
        </div>

        {/* Card 2: Total Sales Volume */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600">
            <IndianRupee className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-2xl font-black font-display leading-tight">{stats.totalValueFormatted}</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Total Sales Value</span>
          </div>
        </div>

        {/* Card 3: Admin Listings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300">
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600">
            <Building className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-2xl font-black font-display leading-tight">{stats.adminListings}</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Admin Uploads</span>
          </div>
        </div>

        {/* Card 4: Seller Listings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-all duration-300">
          <div className="p-4 rounded-xl bg-brand-secondary/10 text-brand-secondary">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-2xl font-black font-display leading-tight">{stats.sellerListings}</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Seller Uploads</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contributor list (left 1/3) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5 lg:col-span-1">
          <h2 className="font-display font-black text-base uppercase tracking-wider text-brand-on-surface">Listing Contributors</h2>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-1">
            {stats.sellerGroups.map((contributor) => (
              <div key={contributor.email} className="py-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-on-surface truncate pr-2 max-w-[200px]" title={contributor.email}>
                  {contributor.email}
                </span>
                <span className="px-2.5 py-1 bg-gray-50 text-gray-600 font-bold rounded-full border border-gray-100 shrink-0">
                  {contributor.count} {contributor.count === 1 ? 'listing' : 'listings'}
                </span>
              </div>
            ))}
            {stats.sellerGroups.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No contributors found.</p>
            )}
          </div>
        </div>

        {/* Listings Control Table (right 2/3) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5 lg:col-span-2 overflow-hidden flex flex-col">
          <h2 className="font-display font-black text-base uppercase tracking-wider text-brand-on-surface">Database Listings Control</h2>
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <table className="min-w-full divide-y divide-gray-150 text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest">
                    <th scope="col" className="pb-3 pr-4">Property</th>
                    <th scope="col" className="pb-3 px-4">Price</th>
                    <th scope="col" className="pb-3 px-4">Type</th>
                    <th scope="col" className="pb-3 px-4">Added By</th>
                    <th scope="col" className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {properties.map((p) => {
                    const addedBy = p.agent?.sellerEmail || 'Admin';
                    return (
                      <tr key={p.id} className="hover:bg-brand-surface-container/30 transition-colors">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold block text-brand-on-surface truncate max-w-[150px] sm:max-w-[200px]" title={p.title}>
                              {p.title}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block max-w-[150px]" title={p.location}>
                              {p.location}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-secondary">{p.priceFormatted}</td>
                        <td className="py-3.5 px-4 text-brand-on-surface-variant">{p.propertyType}</td>
                        <td className="py-3.5 px-4 text-brand-on-surface-variant truncate max-w-[100px]" title={addedBy}>
                          {addedBy === 'gopalnaidu085@gmail.com' ? 'Admin' : addedBy}
                        </td>
                        <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEditProperty(p)}
                              className="p-1.5 rounded-md hover:bg-brand-secondary/15 text-brand-secondary transition-colors cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete listing "${p.title}"?`)) {
                                  onDeleteProperty(p.id);
                                }
                              }}
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {properties.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No property listings found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
