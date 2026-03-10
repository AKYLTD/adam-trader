'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  term: string;
  definition: string;
  example?: string;
}

export default function InfoTooltip({ term, definition, example }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 p-0.5 text-slate-400 hover:text-emerald-400 transition"
        title={`What is ${term}?`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 z-50 w-72 bg-slate-800 border border-white/20 rounded-lg shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-emerald-400">{term}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300">{definition}</p>
            {example && (
              <p className="text-xs text-slate-400 mt-2 italic">
                Example: {example}
              </p>
            )}
            <a
              href="/learn"
              className="text-xs text-blue-400 hover:text-blue-300 mt-3 inline-block"
            >
              See full dictionary →
            </a>
          </div>
        </>
      )}
    </span>
  );
}
