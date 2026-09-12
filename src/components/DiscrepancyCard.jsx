import React from 'react';
import { AlertCircle, CheckCircle, Code, Layers, FileText } from 'lucide-react';

export default function DiscrepancyCard({ finding }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-warning">{finding.category}</span>
          <code style={{ fontSize: '0.875rem', color: 'var(--accent-secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            {finding.endpoint}
          </code>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.875rem', borderRadius: '8px', fontSize: '0.875rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
            📄 DOCUMENTED BEHAVIOR
          </span>
          <p style={{ color: '#fca5a5' }}>{finding.documented}</p>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
            ⚡ ACTUAL REAL API BEHAVIOR
          </span>
          <p style={{ color: '#6ee7b7' }}>{finding.actual}</p>
        </div>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>How Discovered:</strong> {finding.how_found}
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>System Impact:</strong> {finding.impact}
      </div>

      {finding.evidence && finding.evidence.length > 0 && (
        <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Reproducible Evidence IDs ({finding.evidence.length}): </span>
          <span style={{ color: 'var(--accent-secondary)' }}>{finding.evidence.slice(0, 10).join(', ')}{finding.evidence.length > 10 ? '...' : ''}</span>
        </div>
      )}
    </div>
  );
}
