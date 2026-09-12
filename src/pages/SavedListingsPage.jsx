import React, { useState, useEffect } from 'react';
import { getSavedListings, removeSavedListing } from '../services/api';
import ListingCard from '../components/ListingCard';
import { Heart, RefreshCw } from 'lucide-react';

export default function SavedListingsPage() {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSaved = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavedListings();
      setSavedListings(data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch saved listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleSaveToggle = (listingId, isSavedNow) => {
    if (!isSavedNow) {
      setSavedListings((prev) => prev.filter((item) => item.listing_id !== listingId));
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Heart size={28} color="#ef4444" fill="#ef4444" />
            Saved <span className="gradient-text">Listings</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Your saved properties persisted on the real backend API (/v1/saved)
          </p>
        </div>
        <button onClick={loadSaved} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={15} /> Refresh Saved
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
          <p>Loading your saved listings from server...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
          Error: {error}
        </div>
      ) : savedListings.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Heart size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Saved Listings Yet</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Click the heart icon on any property listing to save it to your account.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {savedListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              isSaved={true}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
