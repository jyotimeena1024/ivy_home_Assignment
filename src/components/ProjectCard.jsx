import React from 'react';
import { Building2, MapPin, Layers, AlertTriangle } from 'lucide-react';

export default function ProjectCard({ project }) {
  const formatPriceRange = () => {
    if (project.price_min_lakhs == null && project.price_max_lakhs == null) return 'Price on Request';
    const minL = project.price_min_lakhs;
    const maxL = project.price_max_lakhs;

    const minStr = minL >= 100 ? `${(minL / 100).toFixed(2)} Cr` : `${minL} Lakhs`;
    const maxStr = maxL >= 100 ? `${(maxL / 100).toFixed(2)} Cr` : `${maxL} Lakhs`;

    return `₹${minStr} - ₹${maxStr}`;
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge badge-unit" style={{ marginBottom: '0.375rem' }}>
            {project.project_status || 'Project'}
          </span>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginTop: '0.25rem' }}>
            {project.apartment_name}
          </h3>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <MapPin size={14} color="var(--accent-secondary)" />
            {project.locality || 'Bangalore'} &bull; Developer: {project.developer_name || 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-gradient)' }} className="gradient-text">
        {formatPriceRange()}
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
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Total Units</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.total_units || 'N/A'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Area Range</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.min_area_sqft || 0} - {project.max_area_sqft || 0} sqft</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Reported Listings</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.total_listings ?? 0}</span>
        </div>
      </div>

      {project.rera_number && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>RERA: {project.rera_number}</span>
        </div>
      )}
    </div>
  );
}
