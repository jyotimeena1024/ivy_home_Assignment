import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListingById, getSavedListings, addSavedListing, removeSavedListing } from '../services/api';
import { MapPin, Bed, Bath, Layers, Compass, Heart, PhoneCall, ArrowLeft, AlertTriangle, ShieldCheck, Calendar, Globe } from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);
      try {
        const data = await getListingById(id);
        setListing(data);

        // Sync saved status
        try {
          const savedData = await getSavedListings();
          if (savedData && savedData.results) {
            const hasId = savedData.results.some((item) => item.listing_id === id);
            setIsSaved(hasId);
          }
        } catch (sErr) {
          console.warn('Saved status sync warning:', sErr);
        }
      } catch (err) {
        setError(err.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  const handleToggleSave = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await removeSavedListing(id);
        setIsSaved(false);
      } else {
        await addSavedListing(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatPrice = (p) => {
    if (p == null) return 'N/A';
    if (p < 0) return `₹${p.toLocaleString()} (Corrupt/Fake)`;
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Crores`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakhs`;
    return `₹${p.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', maxWidth: '500px', margin: '0 auto' }}>
          <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
          <h3>Property Not Found</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{error || 'Listing ID does not exist.'}</p>
          <button onClick={() => navigate('/listings')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const isCorrupt = (listing.floor > listing.total_floors && listing.total_floors > 0) ||
                    (listing.total_floors <= 0) ||
                    (listing.carpet_area > listing.super_built_up_area && listing.super_built_up_area > 0) ||
                    (listing.bedroom <= 0) || (listing.bathroom <= 0);

  const isFakePrice = listing.price != null && listing.price < 100000;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/listings')} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Listings
        </button>
        <button
          onClick={handleToggleSave}
          disabled={saveLoading}
          className={`btn ${isSaved ? 'btn-danger' : 'btn-primary'}`}
          style={{ fontSize: '0.875rem' }}
        >
          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} />
          {isSaved ? 'Saved in Favourites' : 'Add to Favourites'}
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge ${listing.is_live ? 'badge-live' : 'badge-offline'}`}>
                {listing.is_live ? 'LIVE LISTING' : 'INACTIVE'}
              </span>
              {listing.unit_is_sqm && (
                <span className="badge badge-unit">MagicHomes (sq.m)</span>
              )}
              {isCorrupt && <span className="badge badge-danger">Data Quality Warning</span>}
              {isFakePrice && <span className="badge badge-warning">Bait Price</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
              {listing.apartment_name || 'Independent Residence'}
            </h1>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
              <MapPin size={18} color="var(--accent-secondary)" />
              {listing.locality || 'Bangalore'} &bull; Website: <Globe size={14} inline="true" /> {listing.website || 'Direct'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
              {formatPrice(listing.price)}
            </div>
            {listing.price_per_sqft && (
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
                ₹{listing.price_per_sqft.toLocaleString()} / sq.ft
              </div>
            )}
          </div>
        </div>

        {/* Spec Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Bedrooms</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff' }}>{listing.bedroom || 0} BHK</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Bathrooms</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff' }}>{listing.bathroom || 0} Bath</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Carpet Area</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff' }}>
              {listing.carpet_area_sqft} sq.ft {listing.unit_is_sqm ? `(${listing.carpet_area_raw} sq.m)` : ''}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Floor Level</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff' }}>
              Floor {listing.floor ?? 0} of {listing.total_floors ?? 0}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Facing Direction</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>
              {listing.facing_direction || 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Furnishing</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>
              {listing.furnishing || 'N/A'}
            </span>
          </div>
        </div>

        {/* Description & Contact Seller */}
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>
              Property Overview
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.9375rem' }}>
              {listing.description || 'No description provided for this listing.'}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', height: 'fit-content', background: 'rgba(99, 102, 241, 0.05)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>
              Posted By
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              {listing.posted_by_name || 'Property Owner / Agent'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'capitalize' }}>
              Role: {listing.posted_by || 'Seller'}
            </div>
            {listing.posted_by_contact && (
              <a
                href={`tel:${listing.posted_by_contact}`}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                <PhoneCall size={16} /> Call {listing.posted_by_contact}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
