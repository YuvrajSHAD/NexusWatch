import React, { useState } from 'react';
import { testPerformance } from './services/api';
import { PingResult } from './types';
import ResultsTable from './components/ResultsTable';
import GlobalMap from './components/GlobalMap';
import IntelligencePanel from './components/IntelligencePanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import './App.css';

const App: React.FC = () => {
  const [url, setUrl] = useState('netflix.com');
  const [results, setResults] = useState<PingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleTest = async () => {
    if (!url) {
      setError('Please enter a URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const testResults = await testPerformance(url);
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">NexusWatch</h1>
          <p className="subtitle">
            Global Performance Intelligence powered by Vultr's distributed infrastructure.
          </p>
        </header>
        
        <div className="controls">
          <input
            type="text"
            className="url-input"
            placeholder="Enter a domain (e.g., netflix.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="test-button" 
            onClick={handleTest}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Performance'}
          </button>
        </div>
        
        <div className="results-section">
          {error && <div className="error-message">{error}</div>}
          
          <IntelligencePanel results={results} domain={url} />
        
          <div className="map-table-container">
            <div className="map-wrapper">
              <GlobalMap 
                results={results} 
                isLoading={isLoading}
                hoveredRegion={hoveredRegion}
                onRegionHover={setHoveredRegion}
              />
              {!isLoading && results.length > 0 && (
                <div className="status-message">
                  Analysis complete for {url}.
                </div>
              )}
            </div>
            
            <div className="table-wrapper">
              <ResultsTable 
                results={results} 
                isLoading={isLoading}
                hoveredRegion={hoveredRegion}
                onRegionHover={setHoveredRegion}
              />
              <RecommendationsPanel results={results} domain={url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;