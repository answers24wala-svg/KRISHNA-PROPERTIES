/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Property } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ListingsView from './components/ListingsView';
import DetailView from './components/DetailView';
import UploadView from './components/UploadView';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from './dbService';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  // Navigation State
  const [currentScreen, setScreen] = useState<'home' | 'listings' | 'detail' | 'upload' | 'dashboard'>('home');
  
  // Real-time properties list state (fetched dynamically!)
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Active selected property for detail view
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('8'); // Default to The Grand Skyline Penthouse

  // Search filter sharing between Home & Listings views
  const [searchFilters, setSearchFilters] = useState<any>({});

  // Admin Mode State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // User Auth & Role States
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);

  // Active property currently being edited by admin
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Load properties dynamically
  const loadProperties = async () => {
    setIsLoading(true);
    const result = await dbService.fetchProperties();
    setProperties(result.properties);
    setIsFallback(result.isFallback);
    setDbError(result.error || null);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProperties();

    if (dbService.isLiveDb() && supabase !== null) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || null;
          const role = session.user.user_metadata?.role || 'buyer';
          setUserEmail(email);
          if (email?.toLowerCase() === 'gopalnaidu085@gmail.com') {
            setIsAdmin(true);
            setUserRole('seller');
          } else {
            setIsAdmin(false);
            setUserRole(role);
          }
        }
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const email = session.user.email || null;
          const role = session.user.user_metadata?.role || 'buyer';
          setUserEmail(email);
          if (email?.toLowerCase() === 'gopalnaidu085@gmail.com') {
            setIsAdmin(true);
            setUserRole('seller');
          } else {
            setIsAdmin(false);
            setUserRole(role);
          }
        } else {
          setUserEmail(null);
          setUserRole(null);
          setIsAdmin(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Add new property dynamically
  const handleAddProperty = async (newProperty: Property) => {
    setIsLoading(true);
    try {
      const res = await dbService.addProperty(newProperty);
      if (res.success) {
        await loadProperties();
        setSearchFilters({});
        setScreen('listings');
      } else {
        alert(`Failed to add property: ${res.error}`);
      }
    } catch (err: any) {
      alert(`An error occurred while adding the property: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update property details dynamically
  const handleUpdateProperty = async (updatedProperty: Property) => {
    setIsLoading(true);
    try {
      const res = await dbService.updateProperty(updatedProperty);
      if (res.success) {
        await loadProperties();
        setScreen('listings');
      } else {
        alert(`Failed to update property: ${res.error}`);
      }
    } catch (err: any) {
      alert(`An error occurred while updating the property: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete property dynamically
  const handleDeleteProperty = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await dbService.deleteProperty(id);
      if (res.success) {
        await loadProperties();
      } else {
        alert(`Failed to delete property: ${res.error}`);
      }
    } catch (err: any) {
      alert(`An error occurred while deleting the property: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit property trigger (pre-populate form and switch views)
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setScreen('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find the currently active property details
  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || null;

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface font-sans antialiased text-brand-on-surface">
      {/* Universal Sticky Navigation Header */}
      <Navbar 
        currentScreen={currentScreen} 
        setScreen={(scr) => {
          // If moving away from upload view, reset editing state
          if (scr !== 'upload') {
            setEditingProperty(null);
          }
          setScreen(scr);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onFilterChange={(filters) => {
          setSearchFilters(filters);
          setScreen('listings');
        }}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Content Area with elegant fade transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-on-surface-variant gap-4">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium animate-pulse">Syncing listings...</p>
              </div>
            ) : (
              <>
                {currentScreen === 'home' && (
                  <HomeView 
                    setScreen={(scr) => {
                      setScreen(scr);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    setSelectedPropertyId={setSelectedPropertyId}
                    onSearch={setSearchFilters}
                    properties={properties}
                  />
                )}

                {currentScreen === 'listings' && (
                  <ListingsView 
                    setScreen={(scr) => {
                      setScreen(scr);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    setSelectedPropertyId={setSelectedPropertyId}
                    searchFilters={searchFilters}
                    setSearchFilters={setSearchFilters}
                    properties={properties}
                    isAdmin={isAdmin}
                    userEmail={userEmail}
                    userRole={userRole}
                    onDeleteProperty={handleDeleteProperty}
                    onEditProperty={handleEditProperty}
                  />
                )}

                {currentScreen === 'detail' && activeProperty && (
                  <DetailView 
                    property={activeProperty}
                    onBack={() => {
                      setScreen('listings');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isAdmin={isAdmin}
                    userEmail={userEmail}
                    userRole={userRole}
                  />
                )}

                {currentScreen === 'upload' && (
                  <UploadView 
                    onAddProperty={handleAddProperty}
                    onUpdateProperty={handleUpdateProperty}
                    setScreen={(scr) => {
                      setScreen(scr);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    editingProperty={editingProperty}
                    setEditingProperty={setEditingProperty}
                    userEmail={userEmail}
                  />
                )}

                {currentScreen === 'dashboard' && (
                  <AdminDashboard 
                    properties={properties}
                    onEditProperty={handleEditProperty}
                    onDeleteProperty={handleDeleteProperty}
                    setScreen={(scr) => {
                      setScreen(scr);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Universal Footer */}
      <Footer 
        setScreen={(scr) => {
          setScreen(scr);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectLocality={(locality) => {
          setSearchFilters({ locationQuery: locality });
          setScreen('listings');
        }}
      />
    </div>
  );
}
