import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { Building2, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState('');

  const loadProjects = async (currOffset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects({ limit, offset: currOffset });
      setProjects(data.results || []);
      setTotalCount(data.total || 520);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(offset);
  }, [offset]);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.apartment_name || '').toLowerCase().includes(q) ||
      (p.locality || '').toLowerCase().includes(q) ||
      (p.developer_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Building2 size={28} color="var(--accent-primary)" />
            Real Estate <span className="gradient-text">Projects</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real estate developments with unit-verified prices in Lakhs/Crores
          </p>
        </div>
        <button onClick={() => loadProjects(offset)} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Search projects by name, locality, or developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
          <p>Loading real estate projects...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
          Error: {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3>No projects found matching search query</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
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
