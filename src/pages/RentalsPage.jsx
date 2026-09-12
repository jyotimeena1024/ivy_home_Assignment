import React, { useState, useEffect, useMemo } from 'react';
import { getRentals } from '../services/api';
import RentalCard from '../components/RentalCard';
import { Key, Search, RefreshCw, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const [localityFilter, setLocalityFilter] = useState('');

  const loadRentals = async (currOffset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRentals({ limit, offset: currOffset });
      setRentals(data.results || []);
      setTotalCount(data.total || 1833);
    } catch (err) {
      setError(err.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals(offset);
  }, [offset]);

  const filteredRentals = useMemo(() => {
    if (!localityFilter) return rentals;
    return rentals.filter((item) =>
      (item.locality || '').toLowerCase().includes(localityFilter.toLowerCase())
    );
  }, [rentals, localityFilter]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Key size={28} color="var(--accent-secondary)" />
            Rental <span className="gradient-text">Properties</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Browse rental listings across Bangalore & Indiranagar locality
          </p>
        </div>
        <button onClick={() => loadRentals(offset)} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Filter by locality (e.g. Indiranagar, Koramangala)..."
            value={localityFilter}
            onChange={(e) => setLocalityFilter(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button
          onClick={() => setLocalityFilter('Indiranagar')}
          className={`btn ${localityFilter.toLowerCase() === 'indiranagar' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <MapPin size={14} /> Assigned Locality (Indiranagar)
        </button>
        {localityFilter && (
          <button onClick={() => setLocalityFilter('')} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            Clear Filter
          </button>
        )}
      </div>

      {/* Grid Results */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
          <p>Loading rental listings...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
          Error: {error}
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3>No rental properties found matching filter</h3>
          <button onClick={() => setLocalityFilter('')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Clear Filter
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredRentals.map((rental) => (
            <RentalCard key={rental.listing_id} rental={rental} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0 || loading}
          className="btn btn-secondary"
        >
          <ChevronLeft size={18} /> Previous Page
        </button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Offset {offset} of {totalCount}
        </span>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={offset + limit >= totalCount || loading}
          className="btn btn-secondary"
        >
          Next Page <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
