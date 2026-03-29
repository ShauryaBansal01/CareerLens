import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const { user } = useContext(AuthContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a PDF file first!');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      setResumeData(res.data);
    } catch (error) {
      console.error(error);
      alert('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Your Resume</h2>
      
      {!user ? (
        <p className="text-center text-red-500">Please login to upload your resume.</p>
      ) : (
        <>
          <form onSubmit={handleUpload} className="flex flex-col items-center">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload & Analyze PDF'}
            </button>
          </form>

          {resumeData && (
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Extraction Results</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Matched Skills:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resumeData.extractedSkills?.length > 0 ? resumeData.extractedSkills.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    )) : <span className="text-gray-500">No specific skills extracted.</span>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Education Context:</h4>
                  <p className="text-gray-600 bg-white p-2 rounded shadow-sm inline-block">{resumeData.education}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Experience Context:</h4>
                  <p className="text-gray-600 bg-white p-2 rounded shadow-sm inline-block">{resumeData.experience}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadResume;
