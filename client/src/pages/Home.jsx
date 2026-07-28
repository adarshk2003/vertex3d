import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ModelCard from '../components/ModelCard';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Architecture', 'Characters', 'Vehicles', 'Nature', 'Furniture', 'Electronics', 'Art', 'Other'];

export default function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [latestModels, setLatestModels] = useState([]);
  const [topModels, setTopModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/models/latest'),
      api.get('/models/top'),
    ]).then(([latestRes, topRes]) => {
      setLatestModels(latestRes.data);
      setTopModels(topRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredLatest = activeCategory
    ? latestModels.filter(m => m.category === activeCategory)
    : latestModels;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">✦ 3D Model Platform</div>
        <h1>
          Discover & Share<br />
          <span className="gradient-text">Stunning 3D Models</span>
        </h1>
        <p>
          Explore thousands of interactive 3D models from creators worldwide.
          Upload your own and get discovered by the community.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/upload" className="btn btn-primary">
              ⬆ Upload Model
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Start Creating</Link>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{latestModels.length}+</div>
            <div className="hero-stat-label">Models</div>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--glass-border)' }} />
          <div>
            <div className="hero-stat-num">GLB</div>
            <div className="hero-stat-label">Formats</div>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--glass-border)' }} />
          <div>
            <div className="hero-stat-num">Free</div>
            <div className="hero-stat-label">Forever</div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── Category Filter ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          <button
            className={`btn btn-sm ${activeCategory === '' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveCategory('')}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Top Models ── */}
        {!activeCategory && topModels.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">🔥 Top <span>Models</span></h2>
              <span className="section-link">Sorted by views</span>
            </div>
            <div className="models-row">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : topModels.slice(0, 4).map(m => <ModelCard key={m._id} model={m} />)
              }
            </div>
          </section>
        )}

        {/* ── Latest Models ── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory ? activeCategory : '✨ Latest'} <span>Models</span>
            </h2>
            <span className="section-link">{filteredLatest.length} results</span>
          </div>

          {loading ? (
            <div className="models-grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredLatest.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🗂️</div>
              <h3>No models yet</h3>
              <p>Be the first to upload one!</p>
              {user && <Link to="/upload" className="btn btn-primary" style={{ marginTop: 16 }}>Upload Now</Link>}
            </div>
          ) : (
            <div className="models-grid">
              {filteredLatest.map(m => <ModelCard key={m._id} model={m} />)}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      marginBottom: 16,
      breakInside: 'avoid',
    }}>
      <div style={{
        aspectRatio: '1/1',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '70%' }} />
        <div style={{ height: 11, background: 'rgba(255,255,255,0.04)', borderRadius: 6, width: '45%' }} />
      </div>
    </div>
  );
}
