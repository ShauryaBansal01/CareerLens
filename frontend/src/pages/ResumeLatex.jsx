import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const ResumeLatex = () => {
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLatex = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get('http://localhost:5000/api/resume/latex', config);
          if (data.rawLatexCode) {
            setLatexCode(data.rawLatexCode);
          } else {
            setLatexCode('% Start writing your LaTeX resume here!\n\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}');
          }
        }
      } catch (error) {
        console.error('Failed to fetch LaTeX code', error);
      }
    };
    fetchLatex();
  }, []);

  const handleEditorChange = (value) => {
    setLatexCode(value);
  };

  const saveLatex = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/resume/latex', { rawLatexCode: latexCode }, config);
      setMessage('Saved successfully!');
    } catch (error) {
      setMessage('Failed to save.');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const generateFromProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/latex/generate', {}, config);
      setLatexCode(data.rawLatexCode);
      setMessage('Generated from profile!');
    } catch (error) {
      setMessage('Failed to generate from profile. Ensure you uploaded a resume first.');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const compilePdf = () => {
    // We use latexonline.cc as a reliable public compiler endpoint for the preview
    // Note: for production, a dedicated Wasm worker or backend is recommended,
    // but this fulfills the client-side/zero-backend-dependency constraint effectively for a prototype.
    const encoded = encodeURIComponent(latexCode);
    const url = `https://latexonline.cc/compile?text=${encoded}&force=true`;
    setPdfUrl(url);
  };

  const downloadTex = () => {
    const element = document.createElement("a");
    const file = new Blob([latexCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "resume.tex";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">LaTeX Resume Builder</h1>
          {message && <span className="ml-4 text-sm text-green-600 font-medium">{message}</span>}
        </div>
        <div className="space-x-3">
          <button 
            onClick={generateFromProfile} 
            disabled={loading}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded font-medium hover:bg-indigo-200"
          >
            {loading ? 'Generating...' : 'Import from Profile'}
          </button>
          <button 
            onClick={saveLatex} 
            disabled={saving}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Code'}
          </button>
          <button 
            onClick={downloadTex} 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-300"
          >
            Download .tex
          </button>
          <button 
            onClick={compilePdf} 
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
          >
            Compile PDF
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Monaco Editor */}
        <div className="w-1/2 h-full border-r border-gray-300">
          <Editor
            height="100%"
            defaultLanguage="latex"
            theme="vs-dark"
            value={latexCode}
            onChange={handleEditorChange}
            options={{
              wordWrap: 'on',
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        {/* Right pane: PDF Preview */}
        <div className="w-1/2 h-full bg-gray-200 flex items-center justify-center">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p>Click "Compile PDF" to preview your resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeLatex;