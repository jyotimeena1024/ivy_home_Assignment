import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Layers, Compass, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { addSavedListing, removeSavedListing } from '../services/api';

export default function ListingCard({ listing, isSaved: initialIsSaved, onSaveToggle }) {
  const [saved, setSaved] = useState(initialIsSaved || false);
  const [loading, setLoading] = useState(false);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (saved) {
        await removeSavedListing(listing.listing_id);
        setSaved(false);
        if (onSaveToggle) onSaveToggle(listing.listing_id, false);
      } else {
        await addSavedListing(listing.listing_id);
        setSaved(true);
        if (onSaveToggle) onSaveToggle(listing.listing_id, true);
      }
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => {
    if (p == null) return 'N/A';
    if (p < 0) return `₹${p.toLocaleString()} (Corrupt/Fake)`;
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakhs`;
    return `₹${p.toLocaleString()}`;
  };

  // Data Quality check
  const isCorrupt = (listing.floor > listing.total_floors && listing.total_floors > 0) ||
                    (listing.total_floors <= 0) ||
                    (listing.carpet_area > listing.super_built_up_area && listing.super_built_up_area > 0) ||
                    (listing.bedroom <= 0) || (listing.bathroom <= 0);

  const isFakePrice = listing.price != null && listing.price < 100000;

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Banner Image / Header */}
      <div style={{
        height: '160px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        {/* Save/Heart Button */}
        <button
          onClick={handleHeartClick}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '2.25rem',
            height: '2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.15s ease'
          }}
          title={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart size={18} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : '#ffffff'} />
        </button>

        {/* Website & Live Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.375rem' }}>
          <span className={`badge ${listing.is_live ? 'badge-live' : 'badge-offline'}`}>
            {listing.is_live ? 'LIVE' : 'INACTIVE'}
          </span>
          {listing.unit_is_sqm && (
            <span className="badge badge-unit" title="API reports carpet area in square meters">
              MagicHomes (sq.m)
            </span>
          )}
          {isCorrupt && (
            <span className="badge badge-danger" title="Data quality alert: Physically impossible values">
              Data Issue
            </span>
          )}
          {isFakePrice && (
            <span className="badge badge-warning" title="Suspected clickbait / rental price listing">
              Bait Price
            </span>
          )}
        </div>

        {/* Apartment Title Overlay */}
        <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.25rem' }}>
            {listing.apartment_name || 'Independent Residence'}
          </h3>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <MapPin size={14} color="var(--accent-secondary)" />
            {listing.locality || 'Bangalore'}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {/* Price & Price per sqft */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: '800', color: '#ffffff' }}>
              {formatPrice(listing.price)}
            </div>
            {listing.price_per_sqft && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ₹{listing.price_per_sqft.toLocaleString()} / sq.ft
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>
            {listing.property_type || 'Apartment'}
          </div>
        </div>

        {/* Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.625rem',
          fontSize: '0.8125rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Bed size={15} color="var(--accent-primary)" />
            <span>{listing.bedroom || 0} BHK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Bath size={15} color="var(--accent-primary)" />
            <span>{listing.bathroom || 0} Bath</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
            <Layers size={15} color="var(--accent-primary)" />
            <span>{listing.carpet_area_sqft ? `${listing.carpet_area_sqft} sqft` : 'N/A'}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/listings/${listing.listing_id}`}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
          >
            View Details
          </Link>
          {listing.posted_by_contact && (
            <a
              href={`tel:${listing.posted_by_contact}`}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.75rem' }}
              title={`Call ${listing.posted_by_name || 'Seller'}: ${listing.posted_by_contact}`}
            >
              <PhoneCall size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
