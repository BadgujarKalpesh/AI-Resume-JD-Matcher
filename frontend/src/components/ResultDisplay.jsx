import React from 'react';
import { Target, Info, Lightbulb, CheckCircle2 } from 'lucide-react';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold">{result.candidate_name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{result.job_title}</p>
        </div>
        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreBg(result.score)}`}>
          <span className={`text-3xl font-black ${getScoreColor(result.score)}`}>{result.score}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">Match Score</span>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="flex items-center gap-2 font-bold text-lg mb-2">
            <Info className="text-blue-500" size={20} /> Analysis Overview
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
            "{result.explanation}"
          </p>
        </section>

        <section className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
          <h3 className="flex items-center gap-2 font-bold text-lg mb-3">
            <Lightbulb className="text-yellow-600" size={20} /> Recommended Improvements
          </h3>
          <ul className="space-y-2">
            {result.edit_suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1 text-yellow-600">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </section>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 text-sm text-blue-500 hover:underline flex items-center gap-1"
      >
        <CheckCircle2 size={14} /> Analyze Another
      </button>
    </div>
  );
};

export default ResultDisplay;
