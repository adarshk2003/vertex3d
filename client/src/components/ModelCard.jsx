import { useNavigate } from 'react-router-dom';
import ModelViewer from './ModelViewer';

export default function ModelCard({ model }) {
  const navigate = useNavigate();

  const initials = model.author?.username
    ? model.author.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="model-card fade-in" onClick={() => navigate(`/model/${model._id}`)}>
      {/* 3D Viewer Thumbnail */}
      <div className="model-card-canvas">
        <ModelViewer
          fileUrl={model.fileUrl}
          fileFormat={model.fileFormat}
          autoRotate={true}
          mini={true}
        />
        <span className="model-card-category">{model.category}</span>
      </div>

      {/* Card Body */}
      <div className="model-card-body">
        <div className="model-card-title">{model.title}</div>
        <div className="model-card-meta">
          <div className="model-card-author">
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--gradient)',
              fontSize: '0.6rem',
              fontWeight: 800,
              color: '#fff',
              marginRight: 5,
            }}>
              {initials}
            </span>
            {model.author?.username || 'Unknown'}
          </div>

          <div className="model-card-stats">
            {/* Only show comment count — Pinterest style */}
            <span className="stat-pill">
              💬 {model.commentCount ?? 0}
            </span>
            <span className="stat-pill">
              ❤️ {model.likes?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
