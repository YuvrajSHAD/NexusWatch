import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PingResult, LocationData } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GlobalMapProps {
  results: PingResult[];
  isLoading: boolean;
  hoveredRegion: string | null;
  onRegionHover: (region: string | null) => void;
}

const SYDNEY_COORDS = { lat: -33.8688, lng: 151.2093 };

// Move locationData outside the component
const locationData: LocationData = {
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Frankfurt': { lat: 50.1109, lng: 8.6821 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 }
};

const GlobalMap: React.FC<GlobalMapProps> = ({ 
  results, 
  isLoading, 
  hoveredRegion, 
  onRegionHover 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const linesRef = useRef<{ [key: string]: L.Polyline }>({});
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add Sydney marker (central hub)
    const sydneyIcon = L.divIcon({
      html: '<div class="sydney-marker"></div>',
      className: 'sydney-marker-container',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    L.marker([SYDNEY_COORDS.lat, SYDNEY_COORDS.lng], { icon: sydneyIcon })
      .addTo(map)
      .bindPopup('<strong>Sydney</strong><br>Orchestrator & Agent');

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and lines when results change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers and lines
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    Object.values(linesRef.current).forEach(line => map.removeLayer(line));
    markersRef.current = {};
    linesRef.current = {};

    // Add new markers and lines
    results.forEach((result, index) => {
      const coords = locationData[result.region];
      if (!coords) return;

      // Determine marker color based on status
      let markerColor = '#f87171'; // red for failed
      if (result.status === 'success') {
        // Green for success, with gradient based on latency
        if (result.latency_ms && result.latency_ms < 50) {
          markerColor = '#4ade80'; // bright green
        } else if (result.latency_ms && result.latency_ms < 100) {
          markerColor = '#86efac'; // lighter green
        } else {
          markerColor = '#bbf7d0'; // very light green
        }
      }

      // Create custom marker
      const customIcon = L.divIcon({
        html: `<div class="pulse-marker" style="background-color: ${markerColor}; animation-delay: ${index * 0.2}s"></div>`,
        className: 'custom-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      // Add marker to map
      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>${result.region}</strong><br>Status: ${result.status}<br>${result.status === 'success' ? `Latency: ${result.latency_ms} ms` : `Message: ${result.message || 'N/A'}`}`);
      
      // Add hover events
      marker.on('mouseover', () => onRegionHover(result.region));
      marker.on('mouseout', () => onRegionHover(null));
      
      markersRef.current[result.region] = marker;

      // Create glowing STRAIGHT line from Sydney to this location
      const glowLine = L.polyline(
        [[SYDNEY_COORDS.lat, SYDNEY_COORDS.lng], [coords.lat, coords.lng]],
        {
          color: markerColor,
          weight: 2,
          opacity: 0.7,
          className: 'glow-line', // This class is targeted by CSS for animation
          dashArray: '10, 10',
          dashOffset: `${index * 5}`
        }
      ).addTo(map);
      
      linesRef.current[result.region] = glowLine;

      // Highlight on hover
      if (hoveredRegion === result.region) {
        marker.setZIndexOffset(1000);
        glowLine.setStyle({ weight: 4, opacity: 1 });
      }
    });

  }, [results, mapReady, hoveredRegion, isLoading, onRegionHover]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>
      <div className="map-legend">
        <div className="legend-title">Status Legend</div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4ade80' }}></div>
          <span>Excellent (&lt;50ms)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#86efac' }}></div>
          <span>Good (50-100ms)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#bbf7d0' }}></div>
          <span>Avg (&gt;100ms)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f87171' }}></div>
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;