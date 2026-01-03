import React, { useState, useEffect } from 'react';
import { PingResult } from '../types';
import { getPerformanceInsights } from '../services/inference';

interface IntelligencePanelProps {
  results: PingResult[];
  domain: string;
}

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ results, domain }) => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);

  // Function to check if API key is valid
  const isApiKeyValid = () => {
    const apiKey = process.env.REACT_APP_VULTR_INFERENCE_API_KEY;
    return apiKey && apiKey !== '' && apiKey !== 'your_actual_api_key_here';
  };

  // Function to test the AI connection
  const testAIConnection = async () => {
    try {
      console.log('Testing AI connection...');
      const response = await fetch('https://api.vultrinference.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_VULTR_INFERENCE_API_KEY}`
        }
      });
      
      if (response.ok) {
        console.log('AI connection test successful');
        alert('AI connection is working!');
      } else {
        console.error('AI connection test failed:', response.status);
        alert(`AI connection test failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      alert('AI connection test failed. Check console for details.');
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      setIsLoading(true);
      
      // Check if API key is available and valid
      const hasValidApiKey = !!isApiKeyValid();
      
      setIsUsingAI(hasValidApiKey);
      
      // Log to console for debugging
      console.log(`Using ${hasValidApiKey ? 'AI' : 'Mock'} inference for ${domain}`);
      console.log('API Key status:', hasValidApiKey ? 'Valid' : 'Invalid or missing');
      console.log('API Key value:', process.env.REACT_APP_VULTR_INFERENCE_API_KEY ? 'Present' : 'Missing');
      
      getPerformanceInsights(domain, results)
        .then(data => {
          setInsights(data);
          console.log('Received insights:', data);
        })
        .catch(error => {
          console.error('Failed to get insights:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [results, domain]);

  if (isLoading) {
    return (
      <div className="intelligence-panel">
        <h3>Performance Intelligence</h3>
        <div className="insight-grid">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="insight-card">
              <div className="skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="intelligence-panel">
      <div className="panel-header">
        <h3>Performance Intelligence</h3>
        <div className="panel-controls">
          <div className={`ai-indicator ${isUsingAI ? 'ai-active' : 'ai-mock'}`}>
            {isUsingAI ? '🤖 AI Powered' : '📊 Demo Mode'}
          </div>
        </div>
      </div>
      <div className="insight-grid">
        <div className="insight-card">
          <span className="insight-label">Performance Score</span>
          <span className="insight-value">{insights.performance_score}/100</span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Overall Status</span>
          <span className="insight-value">{insights.insights.overall_performance}</span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Reliability</span>
          <span className="insight-value">{insights.insights.reliability_score.toFixed(1)}%</span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Optimization Potential</span>
          <span className="insight-value">{insights.insights.optimization_potential}</span>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePanel;