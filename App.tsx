import React, { useState, useEffect, useMemo } from 'react';
import NetworkGraph from './components/NetworkGraph';
import FarmDetail from './components/FarmDetail';
import AIConcierge from './components/AIConcierge';
import { FARMS } from './constants';
import { Farm, Itinerary, AppMode } from './types';

const FILTER_CATEGORIES = [
  { id: 'Wine', label: '🍷 Vino', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'Cheese', label: '🧀 Formaggi', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'Meat', label: '🥩 Carne', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'Vegetable', label: '🥕 Ortofrutta', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'Honey', label: '🍯 Miele', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Oil', label: '🫒 Olio', color: 'bg-lime-100 text-lime-800 border-lime-200' },
];

const App: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [visitedFarms, setVisitedFarms] = useState<string[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.EXPLORE);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Load visited from local storage
  useEffect(() => {
    const saved = localStorage.getItem('visitedFarms');
    if (saved) {
      setVisitedFarms(JSON.parse(saved));
    }
  }, []);

  const handleVisit = () => {
    if (selectedFarm && !visitedFarms.includes(selectedFarm.id)) {
      const updated = [...visitedFarms, selectedFarm.id];
      setVisitedFarms(updated);
      localStorage.setItem('visitedFarms', JSON.stringify(updated));
    }
  };

  const handleItineraryGenerated = (itinerary: Itinerary) => {
    setActiveItinerary(itinerary);
    setMode(AppMode.EXPLORE);
  };

  const getHighlightedFarms = () => {
    if (activeItinerary) {
      return activeItinerary.steps.map(s => s.farmId);
    }
    return [];
  };

  const toggleFilter = (categoryId: string) => {
    setActiveFilters(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const displayedFarms = useMemo(() => {
    if (activeFilters.length === 0) return FARMS;
    return FARMS.filter(farm => 
      farm.products.some(product => activeFilters.includes(product.category))
    );
  }, [activeFilters]);

  const clearItinerary = () => setActiveItinerary(null);

  return (
    <div className="relative w-full h-screen bg-earth-50 overflow-hidden font-sans">
      
      {/* Main Content Area (The Map) */}
      <div className="absolute inset-0 z-0">
        <NetworkGraph 
            farms={displayedFarms} 
            onSelectFarm={setSelectedFarm} 
            highlightedFarmIds={getHighlightedFarms()}
        />
      </div>

      {/* Header & Filters */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-[90vw]">
        <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-earth-200 max-w-xs">
          <h2 className="text-earth-900 font-serif font-bold text-lg">Mappa TerreFVG</h2>
          <p className="text-earth-700 text-sm mt-1">
            {displayedFarms.length} Aziende {activeFilters.length > 0 ? 'filtrate' : 'connesse'}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition shadow-sm
                ${activeFilters.includes(cat.id) 
                  ? `${cat.color} ring-2 ring-offset-1 ring-earth-300` 
                  : 'bg-white border-earth-200 text-earth-600 hover:bg-earth-50'}
              `}
            >
              {cat.label}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button 
              onClick={() => setActiveFilters([])}
              className="px-2 py-1.5 rounded-full text-xs text-earth-500 hover:text-earth-800 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Top Bar for Itinerary Info */}
      {activeItinerary && (
          <div className="absolute top-4 right-4 left-4 sm:left-auto z-20 max-w-sm w-full mt-32 sm:mt-0">
              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-nature-200 overflow-hidden animate-fade-in-down">
                  <div className="bg-nature-500 p-3 flex justify-between items-center text-white">
                      <span className="font-bold text-sm">🛤️ Itinerario Attivo</span>
                      <button onClick={clearItinerary} className="text-white hover:text-nature-100 text-xs uppercase font-bold">Chiudi</button>
                  </div>
                  <div className="p-4">
                      <h3 className="font-serif font-bold text-earth-900 mb-1">{activeItinerary.title}</h3>
                      <p className="text-xs text-earth-600 mb-3">{activeItinerary.description}</p>
                      <div className="space-y-2">
                          {activeItinerary.steps.map((step, idx) => {
                              const farm = FARMS.find(f => f.id === step.farmId);
                              if (!farm) return null;
                              return (
                                  <div key={step.farmId} 
                                       onClick={() => setSelectedFarm(farm)}
                                       className="flex items-start gap-2 p-2 bg-earth-50 rounded-lg hover:bg-earth-100 cursor-pointer transition">
                                      <div className="bg-earth-200 text-earth-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                          {idx + 1}
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-earth-800">{farm.name}</p>
                                          <p className="text-[10px] text-earth-500">{step.reason}</p>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Action Button (FAB) for AI */}
      <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-3">
          <button 
            onClick={() => setMode(AppMode.AI_CONCIERGE)}
            className="group flex items-center justify-center w-14 h-14 bg-earth-800 text-white rounded-full shadow-lg hover:bg-earth-900 transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-2xl">✨</span>
            <span className="absolute right-16 bg-earth-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                Crea Itinerario
            </span>
          </button>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur rounded-full shadow-xl border border-earth-100 px-6 py-3 z-30 flex items-center gap-8">
         <div className="flex flex-col items-center cursor-pointer text-earth-900" onClick={() => setSelectedFarm(null)}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.806-.982l-4.661-2.331" /></svg>
             <span className="text-[10px] font-bold uppercase mt-0.5">Mappa</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-earth-400 hover:text-earth-900 transition" onClick={() => alert("Passport feature coming soon!")}>
             <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {visitedFarms.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-nature-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full font-bold">
                        {visitedFarms.length}
                    </span>
                )}
             </div>
             <span className="text-[10px] font-bold uppercase mt-0.5">Passaporto</span>
         </div>
      </div>

      {/* Modals/Overlays */}
      {selectedFarm && (
        <FarmDetail 
            farm={selectedFarm} 
            onClose={() => setSelectedFarm(null)} 
            onVisit={handleVisit}
            hasVisited={visitedFarms.includes(selectedFarm.id)}
        />
      )}

      {mode === AppMode.AI_CONCIERGE && (
        <AIConcierge 
            onClose={() => setMode(AppMode.EXPLORE)}
            onItineraryGenerated={handleItineraryGenerated}
        />
      )}
      
    </div>
  );
};

export default App;