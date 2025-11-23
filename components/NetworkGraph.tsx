import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Farm } from '../types';

interface NetworkGraphProps {
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  highlightedFarmIds?: string[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ farms, onSelectFarm, highlightedFarmIds = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const linesRef = useRef<L.Polyline[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Bounds for FVG to restrict panning
    const fvgBounds = L.latLngBounds(
      L.latLng(45.5, 12.0), // South-West
      L.latLng(46.8, 14.0)  // North-East
    );

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxBounds: fvgBounds,
      maxBoundsViscosity: 1.0 // Sticky bounds
    }).setView([46.1, 13.0], 9); 

    // Google Maps Standard Layer
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Handle resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing lines
    linesRef.current.forEach(line => line.remove());
    linesRef.current = [];

    // Draw Connections (Lines) first so they are behind markers
    const connectionGroup = L.layerGroup().addTo(map);
    
    farms.forEach(farm => {
      farm.connections.forEach(targetId => {
        const target = farms.find(f => f.id === targetId);
        if (target) {
          const latlngs: L.LatLngExpression[] = [
            [farm.lat, farm.lng],
            [target.lat, target.lng]
          ];
          const polyline = L.polyline(latlngs, {
            color: '#8a6a5c',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 10'
          }).addTo(connectionGroup);
          linesRef.current.push(polyline);
        }
      });
    });

    // Update/Create Markers
    farms.forEach(farm => {
      const isHighlighted = highlightedFarmIds.includes(farm.id);
      
      // Custom HTML Icon using Tailwind classes
      const iconHtml = `
        <div class="relative flex items-center justify-center transition-all duration-300 ${isHighlighted ? 'z-50' : 'z-10'}">
          ${isHighlighted ? '<div class="absolute w-full h-full rounded-full bg-red-500/30 animate-ping scale-150"></div>' : ''}
          <div class="relative w-10 h-10 rounded-full border-2 ${isHighlighted ? 'border-red-600 scale-125' : 'border-white hover:scale-110'} shadow-md bg-white overflow-hidden transition-transform duration-200 cursor-pointer">
            <img src="${farm.logo}" class="w-full h-full object-cover" alt="${farm.name}" />
          </div>
          <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 ${isHighlighted ? 'opacity-100' : ''} transition-opacity pointer-events-none z-50">
            <span class="text-[10px] font-bold text-gray-800">${farm.name}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-farm-marker group', 
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (markersRef.current[farm.id]) {
        // Update existing marker
        markersRef.current[farm.id].setLatLng([farm.lat, farm.lng]);
        markersRef.current[farm.id].setIcon(customIcon);
        markersRef.current[farm.id].setZIndexOffset(isHighlighted ? 1000 : 0);
      } else {
        // Create new marker
        const marker = L.marker([farm.lat, farm.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => onSelectFarm(farm));
        markersRef.current[farm.id] = marker;
      }
    });

    // Remove markers for farms that no longer exist in props
    Object.keys(markersRef.current).forEach(id => {
      if (!farms.find(f => f.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

  }, [farms, highlightedFarmIds, onSelectFarm]);

  return (
    <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />
  );
};

export default NetworkGraph;