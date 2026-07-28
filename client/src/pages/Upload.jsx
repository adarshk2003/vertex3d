import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ModelViewer from '../components/ModelViewer';

const CATEGORIES = ['Architecture', 'Characters', 'Vehicles', 'Nature', 'Furniture', 'Electronics', 'Art', 'Other'];

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFormat, setPreviewFormat] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['glb', 'gltf', 'obj'].includes(ext)) {
      setError('Only .glb, .gltf, and .obj files are allowed');
      return;
    }
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setPreviewFormat(ext);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a 3D file');
    if (!form.title.trim()) return setError('Title is required');
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('tags', form.tags);

    try {
      const { data } = await api.post('/models', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/model/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="upload-page">
        <div className="upload-container">
          <div className="empty-state">
            <div className="icon">🔒</div>
            <h3>Sign in required</h3>
            <p>You need to be signed in to upload models.</p>
            <a href="/login" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Model</h1>
          <p>Share your 3D creation with the world</p>
        </div>

        <div className="upload-card">
          {/* Dropzone */}
          <div
            className={`dropzone ${dragging ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">{file ? '✅' : '📦'}</div>
            <div className="dropzone-text">
              {file ? file.name : 'Drop your 3D file here or click to browse'}
            </div>
            <div className="dropzone-hint">Supports .glb · .gltf · .obj — Max 100MB</div>
            {file && (
              <div className="dropzone-file-name">
                {(file.size / 1024 / 1024).toFixed(2)} MB · {file.name.split('.').pop().toUpperCase()}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {/* Live Preview */}
          {previewUrl && (
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '16/9',
              marginBottom: 24,
              background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, var(--bg-layer) 70%)',
              border: '1px solid var(--glass-border)',
            }}>
              <ModelViewer fileUrl={previewUrl} fileFormat={previewFormat} autoRotate />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                id="model-title"
                className="form-input"
                type="text"
                placeholder="e.g. Futuristic Spaceship"
                value={form.title}
                onChange={update('title')}
                required
                maxLength={100}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                id="model-category"
                className="form-select"
                value={form.category}
                onChange={update('category')}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="model-description"
                className="form-textarea"
                placeholder="Describe your model, its use case, and any interesting details…"
                value={form.description}
                onChange={update('description')}
                maxLength={1000}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags <span style={{ color: 'var(--text-muted)' }}>(comma separated)</span></label>
              <input
                id="model-tags"
                className="form-input"
                type="text"
                placeholder="sci-fi, space, low-poly"
                value={form.tags}
                onChange={update('tags')}
              />
            </div>

            {error && <p className="form-error">⚠️ {error}</p>}

            <button
              id="upload-btn"
              className="btn btn-primary"
              type="submit"
              disabled={loading || !file}
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Uploading…
                </span>
              ) : '⬆ Publish Model'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
