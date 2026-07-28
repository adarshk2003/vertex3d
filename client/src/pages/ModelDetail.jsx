import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ModelViewer from '../components/ModelViewer';
import CommentSection from '../components/CommentSection';
import SimilarModels from '../components/SimilarModels';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ModelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/models/${id}`)
      .then(r => {
        setModel(r.data);
        setLikeCount(r.data.likes?.length ?? 0);
        setCommentCount(r.data.commentCount ?? 0);
        setLiked(user ? r.data.likes?.includes(user._id) : false);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/models/${id}/like`);
      setLikeCount(data.likes);
      setLiked(data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this model permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/models/${id}`);
      navigate('/');
    } catch (err) {
      setDeleting(false);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCommentCount = useCallback((updater) => {
    setCommentCount(updater);
  }, []);

  if (loading) return (
    <div className="loading-center" style={{ height: '100vh' }}>
      <div className="spinner" />
      <span>Loading model…</span>
    </div>
  );

  if (!model) return null;

  const initials = model.author?.username?.slice(0, 2).toUpperCase() || '?';
  const isOwner = user && model.author?._id === user._id;

  return (
    <div className="detail-page fade-in">
      <div className="detail-layout">
        {/* ── Left: 3D Viewer ── */}
        <div>
          <div className="detail-viewer">
            <ModelViewer
              fileUrl={model.fileUrl}
              fileFormat={model.fileFormat}
              autoRotate={false}
            />
          </div>

          {/* File info strip */}
          <div style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <span className="tag">📦 {model.fileFormat?.toUpperCase()}</span>
            <span className="tag">👁 {model.views} views</span>
            <span className="tag">📅 {formatDate(model.createdAt)}</span>
          </div>
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className="detail-panel">
          {/* Back */}
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back to Explore
          </Link>

          {/* Category badge */}
          <div>
            <span className="model-card-category" style={{ position: 'static', display: 'inline-block' }}>
              {model.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="detail-title">{model.title}</h1>

          {/* Author */}
          <div className="detail-author-row">
            <div className="author-avatar">{initials}</div>
            <div className="author-info">
              <span className="author-name">@{model.author?.username}</span>
              <span className="author-date">Published {formatDate(model.createdAt)}</span>
            </div>
            {isOwner && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                disabled={deleting}
                style={{ marginLeft: 'auto', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
              >
                {deleting ? '…' : 'Delete'}
              </button>
            )}
          </div>

          {/* Description */}
          {model.description && (
            <p className="detail-description">{model.description}</p>
          )}

          {/* Tags */}
          {model.tags?.length > 0 && (
            <div className="detail-tags">
              {model.tags.map(t => <span key={t} className="tag">#{t}</span>)}
            </div>
          )}

          {/* Stats Row */}
          <div className="detail-stats-row">
            <button
              className={`detail-stat ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              id="like-btn"
            >
              {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </button>
            <div className="detail-stat" style={{ cursor: 'default' }}>
              💬 {commentCount} Comments
            </div>
            <div className="detail-stat" style={{ cursor: 'default' }}>
              👁 {model.views}
            </div>
          </div>

          {/* Download */}
          <a
            href={model.fileUrl}
            download={model.fileName}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ⬇ Download {model.fileFormat?.toUpperCase()}
          </a>

          {/* Comments */}
          <CommentSection
            modelId={id}
            onCountChange={handleCommentCount}
          />
        </div>
      </div>

      {/* ── Similar Models ── */}
      <SimilarModels modelId={id} />
    </div>
  );
}
