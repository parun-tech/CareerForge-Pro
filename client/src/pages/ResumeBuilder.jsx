import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Save, Download, ArrowLeft, Loader2 } from 'lucide-react';

const initialData = {
  name: '',
  email: '',
  phone: '',
  summary: '',
  experience: [{ company: '', role: '', duration: '', description: '' }],
  education: [{ school: '', degree: '', year: '' }],
  skills: ''
};

const ResumeBuilder = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [resumeData, setResumeData] = useState(initialData);
  const [resumeId, setResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.resume) {
      const data = location.state.resume.optimizedContent && Object.keys(location.state.resume.optimizedContent).length > 0 
        ? location.state.resume.optimizedContent 
        : location.state.resume.originalContent;
      
      setResumeData({ ...initialData, ...data });
      setResumeId(location.state.resume._id);
    }
  }, [location]);

  const handleExpChange = (index, field, value) => {
    const newExp = [...resumeData.experience];
    newExp[index][field] = value;
    setResumeData({ ...resumeData, experience: newExp });
  };

  const handleEduChange = (index, field, value) => {
    const newEdu = [...resumeData.education];
    newEdu[index][field] = value;
    setResumeData({ ...resumeData, education: newEdu });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { school: '', degree: '', year: '' }]
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      if (resumeId) {
        await axios.put(`http://localhost:5000/api/resume/update/${resumeId}`, { originalContent: resumeData });
      } else {
        const res = await axios.post('http://localhost:5000/api/resume/create', { originalContent: resumeData });
        setResumeId(res.data._id);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const htmlContent = document.getElementById('resume-preview').innerHTML;
      
      // Need to inline styles for Puppeteer
      const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 40px; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; color: #0f172a; }
            h2 { font-size: 16px; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; color: #334155; text-transform: uppercase; }
            h3 { font-size: 14px; font-weight: bold; margin: 0; }
            p { font-size: 12px; margin: 4px 0; }
            .header { text-align: center; margin-bottom: 24px; }
            .contact { font-size: 12px; color: #64748b; }
            .section { margin-bottom: 16px; }
            .flex-between { display: flex; justify-content: space-between; align-items: baseline; }
            .date { font-size: 12px; color: #64748b; font-style: italic; }
            ul { margin: 8px 0; padding-left: 20px; font-size: 12px; }
            li { margin-bottom: 4px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      const response = await axios.post('http://localhost:5000/api/pdf/generate', { htmlContent: styledHtml }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error generating document');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Resume Builder</h1>
        </div>
        <div className="flex gap-3">
          {error && <span className="text-red-500 text-sm flex items-center">{error}</span>}
          <button onClick={handleSave} disabled={loading} className="btn-secondary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            Save
          </button>
          <button onClick={handleDownload} disabled={downloading} className="btn-primary flex items-center gap-2 pr-6">
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Form */}
        <div className="w-1/2 overflow-y-auto p-6 bg-slate-50 border-r border-slate-200 hide-scrollbar">
          <div className="space-y-8 max-w-xl mx-auto pb-20">
            
            <section className="card">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Personal Info</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="input-field font-medium text-lg" value={resumeData.name} onChange={e => setResumeData({...resumeData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email Address" className="input-field" value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} />
                  <input type="text" placeholder="Phone Number" className="input-field" value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} />
                </div>
                <textarea placeholder="Professional Summary" className="input-field h-24 resize-none" value={resumeData.summary} onChange={e => setResumeData({...resumeData, summary: e.target.value})} />
              </div>
            </section>

            <section className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Experience</h2>
              </div>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="pl-4 border-l-2 border-slate-200 space-y-3 relative group">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Job Title" className="input-field font-medium" value={exp.role} onChange={e => handleExpChange(index, 'role', e.target.value)} />
                      <input type="text" placeholder="Company Name" className="input-field" value={exp.company} onChange={e => handleExpChange(index, 'company', e.target.value)} />
                    </div>
                    <input type="text" placeholder="Duration (e.g. Jan 2020 - Present)" className="input-field text-sm" value={exp.duration} onChange={e => handleExpChange(index, 'duration', e.target.value)} />
                    <textarea placeholder="Bullet points... (one per line is best)" className="input-field h-28 text-sm" value={exp.description} onChange={e => handleExpChange(index, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={addExperience} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700">+ Add Experience</button>
            </section>

            <section className="card">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Education</h2>
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-slate-200">
                    <input type="text" placeholder="School/University" className="input-field col-span-2 font-medium" value={edu.school} onChange={e => handleEduChange(index, 'school', e.target.value)} />
                    <input type="text" placeholder="Degree" className="input-field" value={edu.degree} onChange={e => handleEduChange(index, 'degree', e.target.value)} />
                    <input type="text" placeholder="Year" className="input-field" value={edu.year} onChange={e => handleEduChange(index, 'year', e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={addEducation} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700">+ Add Education</button>
            </section>

            <section className="card">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Skills</h2>
              <textarea placeholder="e.g. JavaScript, React, Node.js" className="input-field h-24" value={resumeData.skills} onChange={e => setResumeData({...resumeData, skills: e.target.value})} />
            </section>

          </div>
        </div>

        {/* Right Preview */}
        <div className="w-1/2 bg-slate-200 p-8 overflow-y-auto flex justify-center items-start">
          <div id="resume-preview" className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl p-10 text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            {/* Template Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900 mb-1">{resumeData.name || 'Your Name'}</h1>
              <div className="text-sm text-slate-600 flex justify-center gap-4">
                <span>{resumeData.email || 'email@example.com'}</span>
                <span>•</span>
                <span>{resumeData.phone || '(555) 555-5555'}</span>
              </div>
            </div>

            {/* Template Summary */}
            {resumeData.summary && (
              <div className="mb-6">
                <p className="text-sm leading-relaxed text-slate-700">{resumeData.summary}</p>
              </div>
            )}

            {/* Template Experience */}
            {resumeData.experience.some(e => e.role || e.company) && (
              <div className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide border-b-2 border-slate-300 pb-1 mb-3 text-slate-800">Experience</h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    exp.role || exp.company ? (
                      <div key={index}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sm text-slate-900">{exp.role}</h3>
                          <span className="text-xs font-medium text-slate-600">{exp.duration}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 mb-2 italic">{exp.company}</div>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-slate-700">
                          {exp.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                            <li key={i} className="leading-snug">{bullet.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Template Education */}
            {resumeData.education.some(e => e.school || e.degree) && (
              <div className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide border-b-2 border-slate-300 pb-1 mb-3 text-slate-800">Education</h2>
                <div className="space-y-3">
                  {resumeData.education.map((edu, index) => (
                    edu.school || edu.degree ? (
                      <div key={index} className="flex justify-between items-baseline">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{edu.school}</h3>
                          <div className="text-sm text-slate-700">{edu.degree}</div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{edu.year}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Template Skills */}
            {resumeData.skills && (
              <div>
                <h2 className="text-base font-bold uppercase tracking-wide border-b-2 border-slate-300 pb-1 mb-3 text-slate-800">Skills</h2>
                <p className="text-sm leading-relaxed text-slate-700">{resumeData.skills}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
