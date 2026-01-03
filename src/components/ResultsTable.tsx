import React from 'react';
import { PingResult } from '../types';

interface ResultsTableProps {
  results: PingResult[];
  isLoading: boolean;
  hoveredRegion: string | null;
  onRegionHover: (region: string | null) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  results, 
  isLoading, 
  hoveredRegion, 
  onRegionHover 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4ade80';
      case 'failed':
        return '#f87171';
      default:
        return '#94a3b8';
    }
  };

  const getLatencyColor = (latency?: number) => {
    if (!latency) return 'transparent';
    if (latency < 50) return '#4ade80';
    if (latency < 100) return '#86efac';
    return '#bbf7d0';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Status</th>
            <th>Latency</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <tr key={`loading-${index}`} className="loading-row">
                <td><div className="skeleton"></div></td>
                <td><div className="skeleton"></div></td>
                <td><div className="skeleton"></div></td>
              </tr>
            ))
          ) : (
            results.map((result, index) => (
              <tr 
                key={result.region} 
                className={`result-row ${hoveredRegion === result.region ? 'hovered' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  borderLeft: `4px solid ${getStatusColor(result.status)}`
                }}
                onMouseEnter={() => onRegionHover(result.region)}
                onMouseLeave={() => onRegionHover(null)}
              >
                <td>{result.region}</td>
                <td className="status-cell">
                  <span 
                    className="status-indicator"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {getStatusIcon(result.status)} {result.status}
                  </span>
                </td>
                <td>
                  {result.status === 'success' && result.latency_ms ? (
                    <div className="latency-container">
                      <div 
                        className="latency-bar" 
                        style={{ 
                          width: `${Math.min(100, (result.latency_ms / 300) * 100)}%`,
                          backgroundColor: getLatencyColor(result.latency_ms)
                        }}
                      ></div>
                      <span className="latency-value">{result.latency_ms} ms</span>
                    </div>
                  ) : (
                    <span className="error-message">{result.message || 'N/A'}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;