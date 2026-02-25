import React, { useState } from 'react';
import MatcherForm from './components/MatcherForm';
import ResultDisplay from './components/ResultDisplay';
import Leaderboard from './components/Leaderboard';
import { BrainCircuit, LayoutGrid, ListOrdered } from 'lucide-react';

function App() {
  const [activeResult, setActiveResult] = useState(null);
  const [view, setView] = useState('analyze'); // 'analyze' or 'leaderboard'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-800">
      
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Resume <span className="text-blue-600 italic">Match</span></h1>
          </div>
          <nav className="flex gap-2">
            <button 
              onClick={() => { setView('analyze'); setActiveResult(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                view === 'analyze' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutGrid size={18} /> Analyze
            </button>
            <button 
              onClick={() => setView('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                view === 'leaderboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ListOrdered size={18} /> Leaderboard
            </button>
          </nav>
        </div>
      </header>

    
      <main className="max-w-6xl mx-auto px-4 py-12">
        {view === 'analyze' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Tip:</strong> Provide a detailed JD and a clean PDF/TXT resume for the most accurate match score.
                </p>
              </div>
              <MatcherForm onResult={(res) => setActiveResult(res)} />
            </div>
            <div>
              {activeResult ? (
                <ResultDisplay result={activeResult} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
                  <BrainCircuit size={64} className="mb-4 opacity-10" />
                  <p className="text-center font-medium">Ready to analyze. Upload a resume to see matching results here.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Leaderboard />
        )}
      </main>

    </div>
  );
}

export default App;
