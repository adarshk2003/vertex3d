import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentSection({ modelId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    api.get(`/comments/${modelId}`)
      .then(r => setComments(r.data))
      .finally(() => setFetching(false));
  }, [modelId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/comments/${modelId}`, { text });
      setComments(prev => [data, ...prev]);
      setText('');
      onCountChange?.((c) => c + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      onCountChange?.((c) => c - 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        💬 {comments.length} Comments
      </div>

      {/* Add comment */}
      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <textarea
            className="comment-input"
            placeholder="Share your thoughts…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={loading || !text.trim()}>
            {loading ? '…' : 'Post'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <a href="/login" style={{ color: 'var(--accent-1)' }}>Sign in</a> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {fetching ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="comment-list">
          {comments.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No comments yet. Be the first!
            </p>
          )}
          {comments.map(c => (
            <div key={c._id} className="comment-item">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
              }}>
                {c.author?.username?.slice(0, 2).toUpperCase() || '?'}
              </div>
              <div className="comment-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="comment-author">{c.author?.username}</span>
                  <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  {user && c.author?._id === user._id && (
                    <button
                      onClick={() => deleteComment(c._id)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                    >
                      delete
                    </button>
                  )}
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
