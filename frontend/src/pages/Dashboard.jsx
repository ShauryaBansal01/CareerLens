import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Briefcase, Map, Folder, AlertTriangle, Target, Zap, TrendingUp, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [resumeData, setResumeData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      try {
        const resumeRes = await axios.get('http://localhost:5000/api/resume', config);
        setResumeData(resumeRes.data);
      } catch (e) {
        if (e.response && e.response.status === 404) setResumeData(null);
      }

      const rolesRes = await axios.get('http://localhost:5000/api/analysis/roles');
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const seedDatabase = async () => {
    try {
      await axios.post('http://localhost:5000/api/analysis/seed');
      await axios.post('http://localhost:5000/api/roadmap/seed');
      await axios.post('http://localhost:5000/api/projects/seed');
      fetchDashboardData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const analysisRes = await axios.post('http://localhost:5000/api/analysis/analyze', { roleId: selectedRole }, config);
      setAnalysis(analysisRes.data);

      const targetRoleName = analysisRes.data.role;
      const missingSkills = analysisRes.data.analysis.missingSkills;

      try {
        const roadmapRes = await axios.post('http://localhost:5000/api/roadmap/generate', { roleName: targetRoleName, missingSkills }, config);
        setRoadmap(roadmapRes.data);
      } catch (err) {
        setRoadmap(null);
      }

      try {
        const projectsRes = await axios.post('http://localhost:5000/api/projects/recommend', { missingSkills }, config);
        setProjects(projectsRes.data);
      } catch (err) {
        setProjects([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 h-[70vh]">
        <div className="text-center">
          <Zap className="mx-auto h-16 w-16 text-indigo-500 mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">You're almost there!</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">Sign in to unlock AI-powered career recommendations and dynamic roadmaps.</p>
          <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg shadow-indigo-500/30 transition-all inline-block">Sign In Now</Link>
        </div>
      </div>
    );
  }

  const chartData = analysis ? [
    { name: 'Matched', value: analysis.analysis.matchedSkills.length, color: '#10B981' }, // emerald-500
    { name: 'Missing', value: analysis.analysis.missingSkills.length, color: '#f43f5e' }  // rose-500
  ] : [];

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-20 pt-4">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Career Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Actionable insights to land your dream job.</p>
        </div>
        
        {roles.length === 0 && (
          <button onClick={seedDatabase} className="mt-4 md:mt-0 flex items-center bg-white border border-amber-300 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg font-semibold shadow-sm transition">
            <AlertTriangle className="w-4 h-4 mr-2" /> Populate Data
          </button>
        )}
      </motion.div>

      {!resumeData ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card bg-indigo-600 border-none p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden overflow-visible relative items-center justify-between z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 w-full md:w-2/3">
            <h3 className="text-2xl font-bold mb-3 flex items-center"><Target className="mr-2" /> Step 1: Upload Your Profile</h3>
            <p className="text-indigo-100 font-medium mb-6 md:mb-0 max-w-lg">Upload your latest resume. Our AI will instantly automatically extract your core technical skills and build a foundation for your career roadmap.</p>
          </div>
          <div className="relative z-10">
            <Link to="/upload" className="bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none flex items-center">
              Let's Go <Target className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-3xl col-span-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Target Role</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">Select the career path you want to follow. We'll cross-reference your resume requirements instantly.</p>
              
              <div className="relative mb-6">
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">Choose a Role...</option>
                  {roles.map(r => (
                    <option key={r._id} value={r._id} className="font-medium text-slate-800">{r.roleName}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleAnalyze} 
              disabled={!selectedRole || loading}
              className="w-full group bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center mt-auto"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>Analyze Profile <Target className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" /></>
              )}
            </button>
          </motion.div>

          {/* Current Skills Display */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl col-span-1 lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-5 relative z-10 flex items-center">
              <Zap className="text-amber-500 w-5 h-5 mr-2" /> Current Arsenal
            </h3>
            
            <div className="relative z-10 pb-16">
              {resumeData.extractedSkills && resumeData.extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {resumeData.extractedSkills.map((skill, index) => (
                    <span key={index} className="px-3.5 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-lg text-sm font-semibold hover:border-indigo-300 hover:text-indigo-700 cursor-default transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 p-8 rounded-xl text-center">
                  <p className="text-slate-500 font-medium">No distinct skills detected automatically.</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 pt-4 border-t border-slate-100 flex justify-end z-10">
               <Link to="/upload" className="text-slate-500 hover:text-indigo-600 text-sm font-bold flex items-center transition-colors">
                  <UploadCloud className="w-4 h-4 mr-1" /> Re-upload Resume
               </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pt-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Score & Chart */}
            <motion.div variants={fadeItem} className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl flex flex-col relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
               <div className="flex justify-between items-center w-full mb-6">
                 <h3 className="text-xl font-extrabold text-slate-800">Job Readiness</h3>
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                   <Award className="w-4 h-4 text-indigo-500" />
                 </div>
               </div>
              
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-2 relative z-10 gap-6">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-900 tracking-tighter">
                    {analysis.scoring.totalJobReadinessScore}
                  </p>
                  <div className="flex items-center mt-2 group">
                    <TrendingUp className="w-4 h-4 mr-1 text-emerald-500 group-hover:-translate-y-1 transition-transform" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score / 100</p>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 h-40 flex items-center justify-center -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData} innerRadius={35} outerRadius={60}
                        paddingAngle={6} dataKey="value" stroke="none" cornerRadius={6}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm filter" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                        itemStyle={{ color: '#1e293b' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Gap Analysis Details */}
            <motion.div variants={fadeItem} className="lg:col-span-3 glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-center">
               <h3 className="text-xl font-extrabold text-slate-800 mb-6">Skill Gap Matcher</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                 <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm">
                   <h4 className="flex items-center text-emerald-700 font-extrabold mb-4 pb-2 border-b border-emerald-200/50">
                     <CheckCircle className="w-5 h-5 mr-2" /> Verified Match
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.analysis.matchedSkills.length > 0 ? analysis.analysis.matchedSkills.map(s => (
                         <span key={s} className="px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold shadow-sm">{s}</span>
                      )) : <span className="text-sm text-slate-400 font-medium italic">No direct matches found.</span>}
                   </div>
                 </div>

                 <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 shadow-sm">
                   <h4 className="flex items-center text-rose-700 font-extrabold mb-4 pb-2 border-b border-rose-200/50">
                     <XCircle className="w-5 h-5 mr-2" /> Missing Arsenal
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.analysis.missingSkills.length > 0 ? analysis.analysis.missingSkills.map(s => (
                         <span key={s} className="px-3 py-1.5 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-bold shadow-sm">{s}</span>
                      )) : <span className="text-sm text-emerald-600 font-extrabold">100% Match! Incredible profile.</span>}
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Dynamic Roadmap */}
            {roadmap && (
              <motion.div variants={fadeItem} className="xl:col-span-2 glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl opacity-50 -mt-20 -mr-20 pointer-events-none"></div>
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center mb-8 relative z-10">
                  <Map className="mr-3 text-blue-500 w-7 h-7" /> Path to Mastery
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {['beginner', 'intermediate', 'advanced'].map((level, i) => (
                    <motion.div 
                      key={level} 
                      whileHover={{ y: -4 }}
                      className="bg-white border text-center md:text-left border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 font-bold mb-4 border border-slate-100 shadow-inner">
                        {i + 1}
                      </div>
                      <h4 className="capitalize font-black text-slate-800 text-lg mb-4">{level} Phase</h4>
                      <ul className="space-y-3">
                         {roadmap[level].map((item, idx) => (
                           <li key={idx} className="flex items-start justify-center md:justify-start">
                             <span className="shrink-0 mt-0.5">
                               {item.isMissing ? (
                                 <div className="w-2 h-2 rounded-full bg-rose-500 mr-2.5 mt-1.5 animate-pulse"></div>
                               ) : (
                                 <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 mt-0.5" />
                               )}
                             </span>
                             <span className={`text-sm ${item.isMissing ? 'font-bold text-slate-900 border-b border-rose-200/50 pb-0.5' : 'text-slate-400 line-through decoration-slate-300 font-medium'}`}>
                               {item.skill}
                             </span>
                           </li>
                         ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Project Recommendations */}
            {projects.length > 0 && (
              <motion.div variants={fadeItem} className="xl:col-span-1 glass-panel p-6 md:p-8 rounded-3xl flex flex-col h-full bg-gradient-to-b from-white/60 to-orange-50/20">
                 <h3 className="text-2xl font-extrabold text-slate-800 flex items-center mb-2">
                   <Folder className="mr-3 text-orange-500 w-7 h-7" /> Project Blueprints
                 </h3>
                 <p className="text-slate-500 mb-8 text-sm font-medium">Curated tasks to eliminate your skill gap.</p>
                 
                 <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                   {projects.map((proj, idx) => (
                     <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        key={idx} 
                        className="bg-white border border-orange-100 p-5 rounded-2xl shadow-sm hover:shadow-orange-100/50 hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden group"
                     >
                       <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full"></div>
                       <h4 className="font-extrabold text-slate-800 text-lg mb-2 relative z-10">{proj.title}</h4>
                       <p className="text-slate-500 text-xs font-medium mb-4 leading-relaxed relative z-10">{proj.description}</p>
                       <div className="flex flex-wrap gap-1.5 relative z-10">
                         {proj.requiredSkills.map(s => {
                           const isMissing = analysis.analysis.missingSkills.includes(s.toLowerCase());
                           return (
                             <span key={s} className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wide ${
                               isMissing ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                             }`}>
                               {s}
                             </span>
                           );
                         })}
                       </div>
                     </motion.div>
                   ))}
                 </div>
              </motion.div>
            )}
          </div>
          
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
