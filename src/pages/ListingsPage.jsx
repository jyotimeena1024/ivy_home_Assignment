import React, { useState, useEffect, useMemo } from 'react';
import { getListings, getSavedListings } from '../services/api';
import ListingCard from '../components/ListingCard';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function ListingsPage() {
  const [rawListings, setRawListings] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Filter states
  const [localityFilter, setLocalityFilter] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('ALL');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [furnishingFilter, setFurnishingFilter] = useState('ALL');

  const loadData = async (currentOffset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListings({ limit, offset: currentOffset });
      setRawListings(data.results || []);
      setTotalCount(data.total || 4700);

      // Fetch saved listings to sync heart states
      try {
        const savedData = await getSavedListings();
        if (savedData && savedData.results) {
          const ids = new Set(savedData.results.map((item) => item.listing_id));
          setSavedIds(ids);
        }
      } catch (savedErr) {
        console.warn('Saved listings fetch warning:', savedErr);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(offset);
  }, [offset]);

  // Extract unique localities for dropdown
  const availableLocalities = useMemo(() => {
    const setLoc = new Set();
    rawListings.forEach((item) => {
      if (item.locality) setLoc.add(item.locality.trim().toLowerCase());
    });
    return Array.from(setLoc).sort();
  }, [rawListings]);

  // Client-side Filter Implementation (Ensures filters ALWAYS WORK!)
  const filteredListings = useMemo(() => {
    return rawListings.filter((item) => {
      // 1. Locality Filter
      if (localityFilter) {
        const loc = (item.locality || '').toLowerCase();
        if (!loc.includes(localityFilter.toLowerCase())) return false;
      }

      // 2. Bedroom Filter
      if (bedroomFilter !== 'ALL') {
        const targetBhk = parseInt(bedroomFilter, 10);
        if (targetBhk === 4) {
          if ((item.bedroom || 0) < 4) return false;
        } else {
          if (item.bedroom !== targetBhk) return false;
        }
      }

      // 3. Price Range Filter
      const price = item.price != null ? item.price : 0;
      if (priceMin && price < parseFloat(priceMin)) return false;
      if (priceMax && price > parseFloat(priceMax)) return false;

      // 4. Furnishing Filter
      if (furnishingFilter !== 'ALL') {
        const f = (item.furnishing || '').toLowerCase();
        if (!f.includes(furnishingFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [rawListings, localityFilter, bedroomFilter, priceMin, priceMax, furnishingFilter]);

  const handleSaveToggle = (listingId, isSavedNow) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSavedNow) next.add(listingId);
      else next.delete(listingId);
      return next;
    });
  };

  const resetFilters = () => {
    setLocalityFilter('');
    setBedroomFilter('ALL');
    setPriceMin('');
    setPriceMax('');
    setFurnishingFilter('ALL');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
            Property <span className="gradient-text">Listings</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Explore properties with verified unit conversions and client-side filtering
          </p>
        </div>
        <button onClick={() => loadData(offset)} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: 'var(--accent-secondary)' }}>
          <SlidersHorizontal size={18} />
          <span>Active Filters</span>
          <button onClick={resetFilters} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
            Reset All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* 1. Locality Filter */}
          <div className="form-group">
            <label className="form-label">Locality</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2rem' }}
                placeholder="e.g. Indiranagar, Koramangala..."
                value={localityFilter}
                onChange={(e) => setLocalityFilter(e.target.value)}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* 2. Bedroom Filter */}
          <div className="form-group">
            <label className="form-label">Bedrooms (BHK)</label>
            <select
              className="form-select"
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(e.target.value)}
            >
              <option value="ALL">All Bedrooms</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* 3. Price Range Min */}
          <div className="form-group">
            <label className="form-label">Min Price (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 5000000"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>

          {/* 4. Price Range Max */}
          <div className="form-group">
            <label className="form-label">Max Price (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 20000000"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          {/* 5. Furnishing Filter */}
          <div className="form-group">
            <label className="form-label">Furnishing</label>
            <select
              className="form-select"
              value={furnishingFilter}
              onChange={(e) => setFurnishingFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
          <p>Loading retrievable property records...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#fca5a5' }}>
          Error: {error}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3>No matching property listings found</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Try clearing filters or moving to another page.</p>
          <button onClick={resetFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)' }}>
            Showing {filteredListings.length} properties (Page offset: {offset})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.listing_id}
                listing={listing}
                isSaved={savedIds.has(listing.listing_id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination Controls */}
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
