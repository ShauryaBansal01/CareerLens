import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Briefcase, Map, Folder, AlertTriangle } from 'lucide-react';

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
      
      // Fetch user's resume
      try {
        const resumeRes = await axios.get('http://localhost:5000/api/resume', config);
        setResumeData(resumeRes.data);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          setResumeData(null); // No resume uploaded yet
        }
      }

      // Fetch available roles
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
      alert('Database Seeded Successfully! Refreshing...');
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert('Seeding failed');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Analyze Skill Gap
      const analysisRes = await axios.post('http://localhost:5000/api/analysis/analyze', { roleId: selectedRole }, config);
      setAnalysis(analysisRes.data);

      const targetRoleName = analysisRes.data.role;
      const missingSkills = analysisRes.data.analysis.missingSkills;

      // Generate Roadmap
      try {
        const roadmapRes = await axios.post('http://localhost:5000/api/roadmap/generate', { 
          roleName: targetRoleName, 
          missingSkills 
        }, config);
        setRoadmap(roadmapRes.data);
      } catch (err) {
        setRoadmap(null); // If no roadmap template found
      }

      // Recommend Projects
      try {
        const projectsRes = await axios.post('http://localhost:5000/api/projects/recommend', { missingSkills }, config);
        setProjects(projectsRes.data);
      } catch (err) {
        setProjects([]);
      }

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Analysis failed. Please ensure you have uploaded a resume.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Smart Career Navigator</h2>
          <p className="text-gray-600 mb-6">Please log in to access your personalized dashboard.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Login</Link>
        </div>
      </div>
    );
  }

  // Chart data configuration
  const chartData = analysis ? [
    { name: 'Matched', value: analysis.analysis.matchedSkills.length, color: '#10B981' }, // Green
    { name: 'Missing', value: analysis.analysis.missingSkills.length, color: '#EF4444' }  // Red
  ] : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      
      {/* Header Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Career Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
        </div>
        
        {roles.length === 0 && (
          <button onClick={seedDatabase} className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium shadow transition">
            <AlertTriangle className="inline w-4 h-4 mr-2" />
            Seed Database
          </button>
        )}
      </div>

      {/* Resume Section */}
      {!resumeData ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-2">No Resume Found</h3>
          <p className="text-blue-600 mb-4">We need your resume to analyze your skills and provide a roadmap.</p>
          <Link to="/upload" className="bg-blue-600 text-white px-5 py-2 inline-block rounded hover:bg-blue-700 transition">Upload Resume</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Analysis Controls */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><Briefcase className="mr-2 text-indigo-500" /> Target Role</h3>
            <p className="text-gray-600 text-sm mb-4">Select a target career to see your skill gaps and customized roadmap.</p>
            
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 mb-4 bg-gray-50 text-gray-800"
            >
              <option value="">-- Choose a Role --</option>
              {roles.map(r => (
                <option key={r._id} value={r._id}>{r.roleName}</option>
              ))}
            </select>
            
            <button 
              onClick={handleAnalyze} 
              disabled={!selectedRole || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Analyzing...' : 'Generate AI Insights'}
            </button>
          </div>

          {/* Extracted Current Skills */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Extracted Skills</h3>
            {resumeData.extractedSkills && resumeData.extractedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resumeData.extractedSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No technical skills were automatically detected in your resume.</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
               <Link to="/upload" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Re-upload Resume</Link>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Score & Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-800 w-full mb-2">Job Readiness Analysis</h3>
              
              <div className="flex w-full mt-4">
                <div className="w-1/2 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 text-center uppercase tracking-wide">Overall Score</p>
                  <p className="text-5xl font-black text-center mt-2 text-indigo-600">
                    {analysis.scoring.totalJobReadinessScore}<span className="text-2xl text-gray-400">/100</span>
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-2">Based on Skills, Experience & Projects</p>
                </div>
                
                <div className="w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData} innerRadius={50} outerRadius={70}
                        paddingAngle={5} dataKey="value" stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gap Analysis Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-gray-800 mb-4">Skill Gap Breakdown</h3>
               
               <div className="mb-6">
                 <h4 className="flex items-center text-green-700 font-semibold mb-2">
                   <CheckCircle className="w-5 h-5 mr-1" /> Matched Skills
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {analysis.analysis.matchedSkills.length > 0 ? analysis.analysis.matchedSkills.map(s => (
                       <span key={s} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">{s}</span>
                    )) : <span className="text-sm text-gray-500">None</span>}
                 </div>
               </div>

               <div>
                 <h4 className="flex items-center text-red-700 font-semibold mb-2">
                   <XCircle className="w-5 h-5 mr-1" /> Missing Required Skills
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {analysis.analysis.missingSkills.length > 0 ? analysis.analysis.missingSkills.map(s => (
                       <span key={s} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">{s}</span>
                    )) : <span className="text-sm text-emerald-600 font-bold">You match all required skills!</span>}
                 </div>
               </div>
            </div>
          </div>

          {/* Dynamic Roadmap */}
          {roadmap && (
            <div className="bg-white p-6 justify-between rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <Map className="mr-2 text-blue-500" /> Dynamic Learning Roadmap
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <div key={level} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="capitalize font-bold text-gray-700 border-b pb-2 mb-3">{level}</h4>
                    <ul className="space-y-3">
                       {roadmap[level].map((item, idx) => (
                         <li key={idx} className="flex items-start">
                           {item.isMissing ? (
                             <XCircle className="w-5 h-5 mr-2 text-red-500 shrink-0 mt-0.5" />
                           ) : (
                             <CheckCircle className="w-5 h-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                           )}
                           <span className={`text-sm ${item.isMissing ? 'font-bold text-gray-900 border-b-2 border-red-200' : 'text-gray-500 line-through'}`}>
                             {item.skill}
                           </span>
                         </li>
                       ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Recommendations */}
          {projects.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                 <Folder className="mr-2 text-orange-500" /> Recommended Projects
               </h3>
               <p className="text-gray-600 mb-6 text-sm">These projects will help you master your missing skills.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {projects.map((proj, idx) => (
                   <div key={idx} className="border border-orange-200 bg-orange-50/30 p-5 rounded-xl hover:shadow-md transition">
                     <h4 className="font-bold text-gray-800 text-lg mb-2">{proj.title}</h4>
                     <p className="text-gray-600 text-sm mb-4">{proj.description}</p>
                     <div className="flex flex-wrap gap-2">
                       {proj.requiredSkills.map(s => (
                         <span key={s} className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           analysis.analysis.missingSkills.includes(s.toLowerCase()) ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-700'
                         }`}>
                           {s}
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default Dashboard;
