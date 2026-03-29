import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';

const Home = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Smart Career Navigator (Home)</h1>
    <p className="mt-4">Welcome to the Dashboard.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<UploadResume />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
