import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Check, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/stripe/create-checkout', {});
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 p-2 hover:bg-slate-200 rounded-full transition text-slate-600">
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-4xl mx-auto text-center mb-12 mt-8">
        <Crown size={56} className="mx-auto text-indigo-600 mb-6" />
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Invest in Your Career</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The best investment you can make is in yourself. Unlock the full power of our AI to land interviews faster and command a higher salary.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        
        {/* Free Plan */}
        <div className="card relative border-2 border-slate-200 opacity-80 hover:opacity-100 transition duration-300 xl:scale-95">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Free Plan</h3>
            <div className="text-4xl font-black text-slate-900 mb-6">$0<span className="text-lg text-slate-500 font-medium">/forever</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-slate-600"><Check className="text-primary-500 shrink-0" /> Create 1 Resume</li>
              <li className="flex gap-3 text-slate-600"><Check className="text-primary-500 shrink-0" /> Basic PDF Export</li>
              <li className="flex gap-3 text-slate-600"><Check className="text-primary-500 shrink-0" /> ATS Score Calculation</li>
            </ul>
            <button className="w-full btn-secondary cursor-default" disabled>
              {user?.plan === 'free' ? 'Current Plan' : 'Free Forever'}
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="card relative border-2 border-indigo-500 shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white font-bold tracking-widest text-xs uppercase px-4 py-1 rounded-full">
            Recommended
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Pro Plan</h3>
            <div className="text-4xl font-black text-slate-900 mb-6">$19.99<span className="text-lg text-slate-500 font-medium">/lifetime</span></div>
            <ul className="space-y-4 mb-8 font-medium">
              <li className="flex gap-3 text-slate-700"><Check className="text-indigo-500 shrink-0" /> Unlimited Resumes</li>
              <li className="flex gap-3 text-slate-700"><Check className="text-indigo-500 shrink-0" /> AI Bullet Point Rewriting</li>
              <li className="flex gap-3 text-slate-700"><Check className="text-indigo-500 shrink-0" /> AI Cover Letter Generation</li>
              <li className="flex gap-3 text-slate-700"><Check className="text-indigo-500 shrink-0" /> Premium ATS Suggestions</li>
              <li className="flex gap-3 text-slate-700"><Check className="text-indigo-500 shrink-0" /> Priority Support</li>
            </ul>
            <button 
              onClick={handleUpgrade}
              disabled={loading || user?.plan === 'pro'}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all shadow-indigo-300 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? 'Processing...' : user?.plan === 'pro' ? 'You are Pro' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
