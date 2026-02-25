import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const MatcherForm = ({ onResult }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF or .txt file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
      setError('Both Job Description and Resume are required');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/match`, formData);
      onResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="text-blue-500" /> Analyze New Resume
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resume (PDF or .txt)</label>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`p-8 border-2 border-dashed rounded-lg text-center transition-all ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
              }`}>
              <Upload className={`mx-auto mb-2 ${file ? 'text-green-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <p className="text-sm">
                {file ? file.name : 'Click or drag to upload resume'}
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Send size={18} /> Run Match Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MatcherForm;
