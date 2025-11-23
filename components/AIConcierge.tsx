import React, { useState, useRef, useEffect } from 'react';
import { generateItinerary, getTravelAdvice } from '../services/geminiService';
import { Itinerary } from '../types';

interface AIConciergeProps {
  onItineraryGenerated: (itinerary: Itinerary) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string | React.ReactNode;
}

const AIConcierge: React.FC<AIConciergeProps> = ({ onItineraryGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: "Ciao! Sono la tua guida digitale per TerreFVG. Cosa ti piacerebbe fare oggi? Posso suggerirti percorsi per vini, formaggi, relax o gite in famiglia."
    }
  ]);
  const [generatedResult, setGeneratedResult] = useState<Itinerary | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (type: 'user' | 'bot', content: string | React.ReactNode) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content }]);
  };

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    
    const userText = prompt;
    setPrompt('');
    addMessage('user', userText);
    setIsLoading(true);
    setGeneratedResult(null); // Reset previous results

    try {
      const result = await generateItinerary(userText);
      if (result) {
        setGeneratedResult(result);
        addMessage('bot', (
          <div className="flex flex-col gap-3">
            <p>Ho creato un itinerario perfetto per te: <strong>{result.title}</strong>.</p>
            <p className="text-sm italic">{result.description}</p>
            <div className="bg-white/50 p-3 rounded-lg border border-earth-200">
               <ul className="list-disc pl-4 text-sm space-y-1">
                 {result.steps.map((s, i) => (
                   <li key={i}>Tappa {i+1}: Azienda (ID: {s.farmId}) - {s.reason}</li>
                 ))}
               </ul>
            </div>
            <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => onItineraryGenerated(result)}
                  className="bg-nature-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-nature-700 transition shadow-sm w-full"
                >
                  🗺️ Visualizza sulla Mappa
                </button>
                <button 
                  onClick={() => handleGetDirections(result)}
                  className="bg-earth-200 text-earth-800 px-4 py-2 rounded-lg font-bold hover:bg-earth-300 transition w-full flex items-center justify-center gap-2"
                >
                  📍 Come arrivo alla 1ª tappa?
                </button>
            </div>
          </div>
        ));
      } else {
        addMessage('bot', "L'IA non è riuscita a generare un itinerario specifico. Prova a riformulare la richiesta.");
      }
    } catch (e) {
      addMessage('bot', "Si è verificato un errore di connessione.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = (itinerary: Itinerary) => {
     if (!navigator.geolocation) {
       addMessage('bot', "Mi dispiace, il tuo browser non supporta la geolocalizzazione.");
       return;
     }

     addMessage('user', "Calcola il percorso dalla mia posizione utilizzando Google Maps.");
     setIsLoading(true);

     navigator.geolocation.getCurrentPosition(
       async (position) => {
         const firstStep = itinerary.steps[0];
         if (!firstStep) return;

         try {
           const { text, groundingChunks } = await getTravelAdvice(
             position.coords.latitude, 
             position.coords.longitude, 
             firstStep.farmId
           );
           
           addMessage('bot', (
             <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-earth-800">
               <span className="font-bold block mb-1">🚗 Consigli di viaggio (Powered by Google Maps):</span>
               <p className="mb-2">{text}</p>
               
               {groundingChunks && groundingChunks.length > 0 && (
                 <div className="mt-2 pt-2 border-t border-blue-200">
                   <span className="text-[10px] uppercase font-bold text-blue-800 block mb-1">Fonti Google Maps:</span>
                   <div className="flex flex-wrap gap-2">
                     {groundingChunks.map((chunk, idx) => {
                       if (chunk.web?.uri) {
                         return (
                           <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                             {chunk.web.title || "Link Map"}
                           </a>
                         );
                       }
                       return null;
                     })}
                   </div>
                 </div>
               )}
             </div>
           ));
         } catch (e) {
           addMessage('bot', "Non sono riuscito a calcolare i consigli di viaggio al momento.");
         } finally {
           setIsLoading(false);
         }
       },
       (error) => {
         setIsLoading(false);
         addMessage('bot', "Non sono riuscito ad accedere alla tua posizione. Verifica i permessi del browser.");
       }
     );
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-earth-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">✨</div>
            <div>
              <h3 className="text-lg font-serif font-bold leading-tight">Concierge AI</h3>
              <p className="text-earth-100 text-xs">Pianificatore intelligente TerreFVG</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-earth-700 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="p-4 overflow-y-auto flex-1 bg-earth-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm border 
                ${msg.type === 'bot' ? 'bg-earth-200 border-earth-300' : 'bg-nature-100 border-nature-300'}`}>
                 {msg.type === 'bot' ? '🤖' : '👤'}
              </div>
              <div className={`max-w-[80%] p-3 text-sm shadow-sm
                ${msg.type === 'bot' 
                  ? 'bg-white rounded-br-xl rounded-tr-xl rounded-bl-xl text-earth-800' 
                  : 'bg-nature-500 text-white rounded-bl-xl rounded-tl-xl rounded-br-xl'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-center ml-1">
               <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center">🤖</div>
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                 <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               </div>
            </div>
          )}
        </div>

        {/* Suggestions (only if empty) */}
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-earth-50 shrink-0 overflow-x-auto no-scrollbar">
             <div className="flex gap-2">
               <button onClick={() => setPrompt("Voglio assaggiare vini rossi e formaggi forti")} className="whitespace-nowrap bg-white border border-earth-200 px-3 py-2 rounded-full text-xs text-earth-700 hover:bg-earth-100 transition">🍷 Vino e Formaggio</button>
               <button onClick={() => setPrompt("Gita domenicale con bambini, miele e animali")} className="whitespace-nowrap bg-white border border-earth-200 px-3 py-2 rounded-full text-xs text-earth-700 hover:bg-earth-100 transition">👨‍👩‍👧‍👦 Famiglia</button>
               <button onClick={() => setPrompt("Shopping gastronomico veloce")} className="whitespace-nowrap bg-white border border-earth-200 px-3 py-2 rounded-full text-xs text-earth-700 hover:bg-earth-100 transition">🛍️ Shopping</button>
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-earth-100 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generatedResult ? "Fai un'altra richiesta..." : "Descrivi la tua gita ideale..."}
              className="w-full bg-earth-50 border border-earth-200 rounded-full py-3 pl-4 pr-12 text-earth-900 focus:outline-none focus:ring-2 focus:ring-earth-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1 top-1 bottom-1 bg-earth-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-earth-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
               <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConcierge;