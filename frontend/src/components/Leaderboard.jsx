import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Trophy, RefreshCw, Trash2, Download, Eye, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';

const Leaderboard = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEval, setSelectedEval] = useState(null);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/evaluations?page=${page}&limit=5`);
      setEvaluations(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/evaluations/${id}`);
      fetchEvaluations();
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const handleDownloadResume = (id) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/resume/${id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Evaluation History
          </h2>
          <button
            onClick={fetchEvaluations}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {evaluations.map((evalItem) => (
                <tr key={evalItem.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{evalItem.candidate_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{evalItem.job_title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${evalItem.score >= 80 ? 'bg-green-100 text-green-700' :
                      evalItem.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {evalItem.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <button onClick={() => setSelectedEval(evalItem)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center gap-1" title="View Detail"><Eye size={16} /> View</button>
                      <button onClick={() => handleDownloadResume(evalItem.id)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-all flex items-center gap-1" title="Download Resume"><FileDown size={16} /> CV</button>
                      <button onClick={() => handleDelete(evalItem.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {evaluations.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No evaluations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for View Details */}
      {selectedEval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-bold">Evaluation Details</h3>
              <button onClick={() => setSelectedEval(null)} className="text-gray-500 hover:text-red-500">Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs uppercase text-gray-500">Candidate</label><p className="font-bold">{selectedEval.candidate_name}</p></div>
                <div><label className="text-xs uppercase text-gray-500">Score</label><p className="text-2xl font-black text-blue-600">{selectedEval.score}%</p></div>
              </div>
              <div><label className="text-xs uppercase text-gray-500">Role</label><p>{selectedEval.job_title}</p></div>
              <div><label className="text-xs uppercase text-gray-500">Explanation</label><p className="text-gray-600 dark:text-gray-300 italic">{selectedEval.explanation}</p></div>
              <div>
                <label className="text-xs uppercase text-gray-500">Suggestions</label>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  {selectedEval.suggestions.map((s, i) => <li key={i} className="text-sm">{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
