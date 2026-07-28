import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ModelCard from './ModelCard';

export default function SimilarModels({ modelId }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!modelId) return;
    setLoading(true);
    api.get(`/models/${modelId}/similar`)
      .then(r => setModels(r.data))
      .finally(() => setLoading(false));
  }, [modelId]);

  if (loading) return (
    <div className="similar-section">
      <div className="loading-center"><div className="spinner" /></div>
    </div>
  );

  if (models.length === 0) return null;

  return (
    <section className="similar-section">
      <h2 className="section-title">
        More Like This <span>✦</span>
      </h2>
      <div className="similar-grid">
        {models.map(m => (
          <ModelCard key={m._id} model={m} />
        ))}
      </div>
    </section>
  );
}
