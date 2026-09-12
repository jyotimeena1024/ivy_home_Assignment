import React from 'react';
import { MapPin, Bed, Bath, ShieldAlert, PhoneCall } from 'lucide-react';

export default function RentalCard({ rental }) {
  const formatPrice = (p) => {
    if (p == null) return 'N/A';
    return `₹${p.toLocaleString()} / mo`;
  };

  const isIndiranagar = rental.locality && rental.locality.toLowerCase().includes('indiranagar');

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className={`badge ${rental.is_live ? 'badge-live' : 'badge-offline'}`} style={{ marginBottom: '0.375rem' }}>
            {rental.is_live ? 'LIVE RENTAL' : 'INACTIVE'}
          </span>
          {isIndiranagar && (
            <span className="badge badge-unit" style={{ marginLeft: '0.375rem' }}>
              Assigned Locality
            </span>
          )}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginTop: '0.25rem' }}>
            {rental.title || rental.apartment_name || 'Rental Property'}
          </h3>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <MapPin size={14} color="var(--accent-secondary)" />
            {rental.locality || 'Bangalore'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
            {formatPrice(rental.price)}
          </div>
          {rental.deposit != null && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deposit: ₹{(rental.deposit / 1000).toFixed(0)}k
            </div>
          )}
        </div>
      </div>

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
          <span>{rental.bedroom || 0} BHK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
          <Bath size={15} color="var(--accent-primary)" />
          <span>{rental.bathroom || 0} Bath</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
          <span style={{ textTransform: 'capitalize' }}>{rental.furnishing || 'N/A'}</span>
        </div>
      </div>

      {rental.posted_by_contact && (
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <a
            href={`tel:${rental.posted_by_contact}`}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem' }}
          >
            <PhoneCall size={14} /> Contact Seller ({rental.posted_by_contact})
          </a>
        </div>
      )}
    </div>
  );
}
