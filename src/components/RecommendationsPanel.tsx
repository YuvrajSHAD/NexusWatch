import React, { useState, useEffect } from 'react';
import { PingResult } from '../types';
import { getPerformanceInsights } from '../services/inference';

interface RecommendationsPanelProps {
  results: PingResult[];
  domain: string;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ results, domain }) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);

  useEffect(() => {
    if (results.length > 0) {
      setIsLoading(true);
      
      // Check if API key is available using !! to ensure a boolean
      const hasApiKey = !!process.env.REACT_APP_VULTR_INFERENCE_API_KEY;
      
      setIsUsingAI(hasApiKey);
      
      getPerformanceInsights(domain, results)
        .then(data => {
          setRecommendations(data.recommendations || []);
          console.log('Received recommendations:', data.recommendations);
        })
        .catch(error => {
          console.error('Failed to get recommendations:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [results, domain]);

  if (isLoading) {
    return (
      <div className="recommendations-panel">
        <h4>Recommendations</h4>
        <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem' }}></div>
        <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem' }}></div>
        <div className="skeleton" style={{ height: '1rem' }}></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-panel">
      <div className="panel-header">
        <h4>{isUsingAI ? '🤖 AI Recommendations' : '📊 Demo Recommendations'}</h4>
      </div>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsPanel;