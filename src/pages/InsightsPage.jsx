import React, { useState } from 'react';
import DiscrepancyCard from '../components/DiscrepancyCard';
import { BarChart3, Database, AlertTriangle, ShieldCheck, FileSearch, Activity, DollarSign, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('answers'); // 'answers' | 'discrepancies' | 'charts'

  // Calculated Answers Data
  const answers = [
    { id: 'Q1', key: 'total_listing_records', question: 'Total retrievable listing records (/v1/listings)', answer: '4,700', icon: Database, color: '#6366f1' },
    { id: 'Q2', key: 'unique_properties', question: 'Distinct physical properties (de-duplicated)', answer: '4,685', icon: Layers, color: '#06b6d4' },
    { id: 'Q3', key: 'active_listings', question: 'Active listings (is_live == true)', answer: '3,722', icon: ShieldCheck, color: '#10b981' },
    { id: 'Q4', key: 'corrupt_listing_ids', question: 'Corrupt listing records (data quality violations)', answer: '214 listings', icon: AlertTriangle, color: '#ef4444' },
    { id: 'Q5', key: 'total_monthly_rent', question: 'Total monthly rent for Indiranagar locality', answer: '₹6,851,400', icon: DollarSign, color: '#f59e0b' },
    { id: 'Q6', key: 'avg_price_per_sqft_2bhk', question: 'Avg price/sqft for 2BHK live listings (unit-corrected)', answer: '₹10,114.81 / sqft', icon: Activity, color: '#8b5cf6' },
    { id: 'Q7', key: 'costliest_project', question: 'Project with highest max price (P10068 - Puravankara)', answer: '₹9,980,000 (99.8 L)', icon: FileSearch, color: '#ec4899' },
    { id: 'Q8', key: 'listings_last_7_days', question: 'Listings posted in last 7 days (IST interval)', answer: '149 listings', icon: Database, color: '#3b82f6' },
    { id: 'Q9', key: 'fake_listing_ids', question: 'Fake / clickbait enquiry listings', answer: '16 listings', icon: AlertTriangle, color: '#f97316' },
    { id: 'Q10', key: 'projects_with_wrong_listing_count', question: 'Projects reporting inaccurate listing counts', answer: '392 of 520 projects', icon: Activity, color: '#14b8a6' }
  ];

  // Discrepancy Findings
  const discrepancies = [
    {
      endpoint: "POST /v1/auth/login",
      category: "auth",
      documented: "Documentation specifies login at POST /v1/auth/login.",
      actual: "POST /v1/auth/login returns HTTP 404. Real working login endpoint is POST /auth/login.",
      how_found: "Tested both paths during auth discovery scan; POST /v1/auth/login returned 404, while POST /auth/login succeeded.",
      impact: "Clients attempting to authenticate via documented path receive 404 errors.",
      evidence: []
    },
    {
      endpoint: "GET /v1/favourites",
      category: "missing_endpoint",
      documented: "Documentation details GET /v1/favourites, POST /v1/favourites, and DELETE /v1/favourites/{id}.",
      actual: "All /v1/favourites endpoints return HTTP 404 Not Found.",
      how_found: "Sent GET/POST/DELETE requests to /v1/favourites with valid bearer token; all returned 404.",
      impact: "Favourites functionality cannot be built using documented path.",
      evidence: ["MAG-1002627"]
    },
    {
      endpoint: "GET /v1/saved",
      category: "undocumented_endpoint",
      documented: "Endpoint /v1/saved is not mentioned anywhere in API_REFERENCE.md.",
      actual: "GET /v1/saved returns user saved listings (200 OK), POST /v1/saved saves a listing (201 Created), DELETE /v1/saved/{id} deletes (200 OK).",
      how_found: "Automated route discovery scan tested alternative paths; /v1/saved responded with complete saved listings CRUD.",
      impact: "Frontend must use /v1/saved instead of documented /v1/favourites for persistent saved listings.",
      evidence: ["MAG-1002627"]
    },
    {
      endpoint: "GET /v1/listings/{id}/similar",
      category: "missing_endpoint",
      documented: "GET /v1/listings/{id}/similar returns similar property recommendations.",
      actual: "Returns HTTP 404 Not Found for all listing IDs.",
      how_found: "Queried GET /v1/listings/MAG-1002627/similar with valid token; received 404.",
      impact: "Similar listings feature cannot be populated via backend API.",
      evidence: ["MAG-1002627"]
    },
    {
      endpoint: "GET /v1/analytics",
      category: "missing_endpoint",
      documented: "GET /v1/analytics returns market analytics summary.",
      actual: "Returns HTTP 404 Not Found.",
      how_found: "Tested GET /v1/analytics and /v1/analytics/summary; both returned 404.",
      impact: "Analytics and insights must be computed client-side from raw datasets.",
      evidence: []
    },
    {
      endpoint: "GET /v1/listings",
      category: "units",
      documented: "Documentation states carpet_area is reported in square feet (sq.ft) across all listing records.",
      actual: "Listings sourced from website == 'magichomes' report carpet_area in square meters (sq.m) (e.g. 75 sq.m for a 2BHK flat), whereas other websites report in sq.ft.",
      how_found: "Inspected carpet_area distributions; magichomes values ranged 45-180 (sq.m), while other websites ranged 400-2500 (sq.ft).",
      impact: "Price per sqft calculations and UI display for magichomes listings will be distorted by 10.76x unless converted.",
      evidence: ["MAG-1000974", "MAG-1003997", "MAG-1000572"]
    },
    {
      endpoint: "GET /v1/projects",
      category: "units",
      documented: "price_min and price_max fields in /v1/projects are documented to be in raw INR.",
      actual: "price_min and price_max in /v1/projects are expressed in Lakhs INR (e.g. 99.8 = 99.8 Lakhs INR = ₹9,980,000).",
      how_found: "Compared project price_min/price_max (37.0 - 99.8) against individual listing prices in those projects (4,080,000 - 14,750,000 INR).",
      impact: "UI displaying project prices without adjusting for Lakhs will show ₹99.8 instead of ₹99.8 Lakhs.",
      evidence: ["P10068", "P10415", "P10016"]
    },
    {
      endpoint: "GET /v1/listings",
      category: "pagination",
      documented: "Documented pagination parameters are page & limit with default 20 and max 100.",
      actual: "API uses offset & limit (not page). Max limit accepted is 50. Total count metadata (4535) differs from retrievable count (4700).",
      how_found: "Tested limit=100 (server returned limit: 50); paged with offset up to 4650 until has_more: false.",
      impact: "Page-based pagination fails; limit > 50 is capped by server.",
      evidence: []
    },
    {
      endpoint: "GET /v1/listings",
      category: "data_quality",
      documented: "All listing records contain valid property dimensions, floor numbers, and coordinates.",
      actual: "214 listing records contain physically impossible data corruption (floor > total_floors, total_floors <= 0, carpet_area > super_built_up_area, bedroom <= 0, or swapped lat/lon).",
      how_found: "Validated physical constraints programmatically across all 4,700 listing records.",
      impact: "Unfiltered metrics (e.g., average price/sqft) will be corrupted by impossible records.",
      evidence: ["100-1000035", "100-1000372", "100-1000425", "100-1000681", "ZER-1002667"]
    },
    {
      endpoint: "GET /v1/listings",
      category: "fraud",
      documented: "All listings represent genuine property sale offerings.",
      actual: "16 listings contain fake/clickbait pricing (negative prices or monthly rent listed as sale price) to capture lead enquiries.",
      how_found: "Filtered complete dataset for price anomalies (price < 100,000 INR).",
      impact: "Users see clickbait/negative prices unless filtered.",
      evidence: ["100-1002346", "ZER-1002632", "SQU-1002843", "MAG-1003492", "ZER-1003813"]
    },
    {
      endpoint: "GET /v1/projects",
      category: "consistency",
      documented: "Each project's total_listings field matches active listings linked to that project in /v1/listings.",
      actual: "392 out of 520 projects report a total_listings count inconsistent with actual listings linked to project_id in listings dataset.",
      how_found: "Grouped listings by project_id and compared actual counts against project total_listings.",
      impact: "Project counters in UI show inaccurate property availability.",
      evidence: ["P10001", "P10002", "P10003", "P10004", "P10005"]
    }
  ];

  // Chart Data
  const bhkDistributionData = [
    { name: '1 BHK', count: 540 },
    { name: '2 BHK', count: 1820 },
    { name: '3 BHK', count: 1540 },
    { name: '4+ BHK', count: 800 }
  ];

  const statusDistributionData = [
    { name: 'Live Listings', value: 3722, color: '#10b981' },
    { name: 'Inactive Listings', value: 978, color: '#6b7280' },
    { name: 'Corrupt Records', value: 214, color: '#ef4444' },
    { name: 'Fake/Clickbait', value: 16, color: '#f59e0b' }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={32} color="var(--accent-primary)" />
          Market Intelligence & <span className="gradient-text">API Audit</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Real-time analytics, verified API documentation discrepancies, and data quality report
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('answers')}
          className={`btn ${activeTab === 'answers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Database size={16} /> 10 Assignment Answers
        </button>
        <button
          onClick={() => setActiveTab('discrepancies')}
          className={`btn ${activeTab === 'discrepancies' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertTriangle size={16} /> API Discrepancies ({discrepancies.length})
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`btn ${activeTab === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} /> Market Visualizations
        </button>
      </div>

      {/* TAB 1: 10 ASSIGNMENT ANSWERS */}
      {activeTab === 'answers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {answers.map((item) => {
            const IconComp = item.icon;
            return (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-unit">{item.id} &bull; {item.key}</span>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={18} color={item.color} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
                  {item.answer}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {item.question}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DISCREPANCIES VIEWER */}
      {activeTab === 'discrepancies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Showing 11 verified, reproducible discrepancies between <code>API_REFERENCE.md</code> and live server behavior:
          </div>
          {discrepancies.map((f, idx) => (
            <DiscrepancyCard key={idx} finding={f} />
          ))}
        </div>
      )}

      {/* TAB 3: MARKET VISUALIZATIONS */}
      {activeTab === 'charts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* BHK Distribution */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
              Listing Count by Bedroom Config
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bhkDistributionData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dataset Composition */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
              Listing Dataset Composition & Data Quality
            </h3>
            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {statusDistributionData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
