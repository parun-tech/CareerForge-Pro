import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FileText, PlusCircle, LogOut, CheckCircle, Crown } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, fetchUser } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/resume');
        setResumes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();

    // Check for success param from Stripe
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');

    if (success && sessionId) {
      axios.get(`http://localhost:5000/api/stripe/verify-session?session_id=${sessionId}`)
        .then(() => {
          setSuccessMsg("Payment successful! You are now a Pro user.");
          if (fetchUser) fetchUser(); // Ensure user state gets updated to 'pro'
          window.history.replaceState({}, document.title, "/dashboard");
        })
        .catch(err => console.error("Session verification failed:", err));
    } else if (success) {
      setSuccessMsg("Payment successful! You are now a Pro user.");
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
          <FileText />
          <span>CareerForge</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-2">
            <span>{user?.name}</span>
            {user?.plan === 'pro' ? (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded flex items-center gap-1 font-semibold">
                <Crown size={14}/> PRO
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-semibold">
                FREE
              </span>
            )}
          </div>
          <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-8 flex items-center gap-2 border border-green-200">
            <CheckCircle size={20} />
            {successMsg}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Your Resumes</h1>
          <Link to="/builder" className="btn-primary flex items-center gap-2">
            <PlusCircle size={20} />
            Create New
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="card text-center py-16 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">No resumes yet</h3>
            <p className="mb-6">Create your first ATS-optimized resume.</p>
            <Link to="/builder" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle size={20} />
              Start Building
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-3 gap-6">
            {resumes.map(resume => (
              <div key={resume._id} className="card hover:border-primary-300 transition group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">
                      {resume.originalContent?.name?.split(' ')[0] || 'My Resume'} - {new Date(resume.createdAt).toLocaleDateString()}
                    </h3>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      ATS Score: <span className="font-medium text-primary-600">{resume.atsScore || 0}%</span>
                    </div>
                  </div>
                  <FileText className="text-slate-300 group-hover:text-primary-500 transition" />
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => navigate('/optimizer', { state: { resume } })} className="flex-1 btn-secondary text-sm py-1.5">
                    Optimize
                  </button>
                  <button onClick={() => navigate('/builder', { state: { resume } })} className="flex-1 btn-primary text-sm py-1.5 bg-slate-800 hover:bg-slate-900 border-none">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user?.plan === 'free' && (
          <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 text-center shadow-inner">
            <Crown size={40} className="mx-auto text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Upgrade to Pro</h2>
            <p className="text-slate-600 mt-2 mb-6 max-w-xl mx-auto">
              Get unlimited resumes, AI cover letter generation, and premium ATS matching to double your interview rate.
            </p>
            <Link to="/payment" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
              View Plans
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
