import React from 'react';
import { Farm } from '../types';

interface FarmDetailProps {
  farm: Farm;
  onClose: () => void;
  onVisit: () => void;
  hasVisited: boolean;
}

const FarmDetail: React.FC<FarmDetailProps> = ({ farm, onClose, onVisit, hasVisited }) => {
  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
      <div className="bg-white w-full md:w-[480px] h-full shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto overflow-y-auto flex flex-col">
        
        {/* Cover Image */}
        <div className="relative h-64 bg-earth-200">
            <img src={`https://picsum.photos/seed/${farm.id}/800/600`} alt={farm.name} className="w-full h-full object-cover" />
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/40 text-white p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="absolute -bottom-10 left-6">
                <img src={farm.logo} alt="Logo" className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white" />
            </div>
        </div>

        <div className="pt-12 px-6 pb-24">
            <div className="flex justify-between items-start mb-2">
                 <h2 className="text-2xl font-serif font-bold text-earth-900">{farm.name}</h2>
                 {hasVisited && (
                     <span className="bg-nature-100 text-nature-800 text-xs px-2 py-1 rounded-full font-bold border border-nature-500">VISITATA</span>
                 )}
            </div>
            <p className="text-earth-600 text-sm mb-6 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {farm.address}
            </p>

            <div className="space-y-6">
                {/* Description */}
                <div className="prose prose-sm text-earth-700">
                    <p>{farm.description}</p>
                </div>

                {/* Specialty */}
                <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                    <h4 className="text-xs font-bold text-earth-500 uppercase tracking-wide mb-1">Specialità</h4>
                    <p className="text-earth-900 font-medium">{farm.specialty}</p>
                </div>

                {/* Products */}
                <div>
                    <h3 className="text-lg font-serif font-bold text-earth-800 mb-3">Prodotti</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {farm.products.map((p, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-white border border-earth-100 p-2 rounded-lg shadow-sm">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                    ${p.category === 'Wine' ? 'bg-red-100 text-red-700' : 
                                      p.category === 'Cheese' ? 'bg-yellow-100 text-yellow-700' :
                                      p.category === 'Vegetable' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {p.category.charAt(0)}
                                </div>
                                <span className="text-sm text-earth-800 font-medium truncate">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Owners */}
                <div>
                     <h3 className="text-lg font-serif font-bold text-earth-800 mb-3">Le Persone</h3>
                     <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                         {farm.owners.map((owner, idx) => (
                             <div key={idx} className="flex-shrink-0 flex flex-col items-center">
                                 <img src={owner.photoUrl} alt={owner.name} className="w-16 h-16 rounded-full object-cover mb-1 border-2 border-earth-200" />
                                 <span className="text-xs font-bold text-earth-900">{owner.name}</span>
                                 <span className="text-[10px] text-earth-500 uppercase">{owner.role}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-earth-100 p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
             <button onClick={onVisit} disabled={hasVisited} className={`flex-1 font-bold py-3 px-4 rounded-xl transition shadow-sm text-center
                ${hasVisited 
                    ? 'bg-nature-100 text-nature-700 cursor-default' 
                    : 'bg-nature-500 text-white hover:bg-nature-700'}
             `}>
                 {hasVisited ? 'Timbro Collezionato! ✨' : '📍 Check-in Qui'}
             </button>
             <button className="bg-earth-100 text-earth-800 p-3 rounded-xl hover:bg-earth-200 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default FarmDetail;