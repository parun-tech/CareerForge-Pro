import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Optimizer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const resume = location.state?.resume;
  const originalData = resume?.originalContent;

  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  if (!resume) {
    return <div className="p-8">No resume selected. <button onClick={() => navigate('/dashboard')} className="text-primary-600 hover:underline">Go back</button></div>;
  }

  const handleOptimize = async () => {
    if (!jdText) return alert("Please paste a job description first.");
    setLoading(true);

    try {
      // 1. Analyze JD
      const jdRes = await axios.post('http://localhost:5000/api/ai/analyze-jd', { jdText });
      const { keywords } = jdRes.data;

      // 2. Score Resume
      const resumeText = JSON.stringify(originalData);
      const atsRes = await axios.post('http://localhost:5000/api/ats/score', { resumeText, jdKeywords: keywords });
      
      // 3. Rewrite points (only the experience section)
      const allBullets = [];
      originalData.experience.forEach(exp => {
        if (exp.description) {
          allBullets.push(...exp.description.split('\n').filter(b => b.trim()));
        }
      });

      let optimizedData = { ...originalData };
      if (allBullets.length > 0) {
        const rewriteRes = await axios.post('http://localhost:5000/api/ai/rewrite', { bullets: allBullets, keywords });
        const optimizedBullets = rewriteRes.data.optimizedBullets;

        // Reconstruct the experience section
        let bulletIndex = 0;
        optimizedData.experience = originalData.experience.map(exp => {
          if (!exp.description) return exp;
          const count = exp.description.split('\n').filter(b => b.trim()).length;
          const newDesc = optimizedBullets.slice(bulletIndex, bulletIndex + count).join('\n');
          bulletIndex += count;
          return { ...exp, description: newDesc };
        });
      }

      // Save optimized content to backend
      await axios.put(`http://localhost:5000/api/resume/update/${resume._id}`, { optimizedContent: optimizedData, atsScore: atsRes.data.score });

      setResults({
        score: atsRes.data.score,
        missing: atsRes.data.missingKeywords,
        suggestions: atsRes.data.suggestions,
        optimizedData
      });

    } catch (err) {
      console.error(err);
      alert('Error during optimization. Please check your API keys and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (user.plan !== 'pro') {
      navigate('/payment');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/cover-letter', { resumeContent: originalData, jdText });
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      alert("Error generating cover letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="font-bold text-xl text-slate-800">AI Optimizer</h1>
          <p className="text-sm text-slate-500">Target your resume to a specific job</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div className="card shadow-md">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText size={20} className="text-primary-600"/> Job Description</h2>
            <textarea 
              className="input-field h-64 font-mono text-sm leading-relaxed" 
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={e => setJdText(e.target.value)}
            />
            <button 
              onClick={handleOptimize} 
              disabled={loading || !jdText} 
              className="w-full btn-primary flex justify-center items-center gap-2 mt-4 py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Analyzing & Rewriting...' : 'Optimize Resume'}
            </button>

            {results && (
              <button onClick={handleCoverLetter} disabled={loading} className="w-full btn-secondary flex justify-center items-center gap-2 mt-4 py-3 border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                <FileText size={18} />
                Generate Cover Letter (Pro)
              </button>
            )}
          </div>

          {coverLetter && (
            <div className="card border-indigo-100 bg-indigo-50/30">
              <h2 className="text-lg font-bold mb-4 text-indigo-900">Your Cover Letter</h2>
              <textarea className="input-field h-96 bg-white" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {!results ? (
            <div className="card h-full flex flex-col items-center justify-center text-slate-400 py-20 px-4 text-center border-dashed border-2 bg-slate-50">
              <Sparkles size={48} className="mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Awaiting Analysis</h3>
              <p className="text-sm">Paste a job description and click Optimize to see your ATS score and AI-enhanced resume.</p>
            </div>
          ) : (
            <>
              {/* Score Card */}
              <div className="card">
                <h2 className="text-lg font-bold mb-6 text-slate-800">ATS Analysis</h2>
                <div className="flex items-center gap-8 mb-6">
                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100">
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="transparent" strokeWidth="8" fill="transparent" />
                      <circle cx="64" cy="64" r="56" stroke={results.score >= 80 ? '#22c55e' : results.score >= 50 ? '#eab308' : '#ef4444'} strokeWidth="8" fill="transparent" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * results.score) / 100} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-800">{results.score}%</div>
                      <div className="text-xs text-slate-500 font-medium">Match</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-lg">Suggestions</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {results.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-primary-500 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {results.missing.length > 0 && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl mt-4">
                    <h4 className="flex items-center gap-2 text-red-800 font-semibold mb-3 text-sm">
                      <AlertCircle size={16} /> Missing Key Terms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {results.missing.slice(0, 15).map((kw, i) => (
                        <span key={i} className="bg-white/80 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Output Button */}
              <div className="card flex items-center justify-between shadow-md border-primary-100 bg-primary-50">
                <div>
                  <h3 className="font-bold text-slate-800">Review Optimized Resume</h3>
                  <p className="text-sm text-slate-600">The AI has rewritten your bullet points.</p>
                </div>
                <button onClick={() => navigate('/builder', { state: { resume: { ...resume, optimizedContent: results.optimizedData, atsScore: results.score } } })} className="btn-primary shadow-primary-500/30 font-bold whitespace-nowrap">
                  View Output
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Optimizer;
