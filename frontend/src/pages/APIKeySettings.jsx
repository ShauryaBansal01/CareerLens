import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Key, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const APIKeySettings = () => {
  const { user } = useContext(AuthContext);
  const [keys, setKeys] = useState([]);
  const [defaultProvider, setDefaultProvider] = useState('gemini');
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ provider: 'gemini', key: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const providers = [
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI' },
  ];

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/keys`, config);
      setKeys(data.data);
      if (data.defaultProvider) setDefaultProvider(data.defaultProvider);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/keys`, formState, config);
      setSuccess(`API Key for ${providers.find(p => p.id === formState.provider).name} saved and validated successfully!`);
      setFormState({ ...formState, key: '' });
      fetchKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save API key. Is it valid?');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/keys/${id}`, config);
      setKeys(keys.filter(k => k.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-[var(--text-muted)] font-medium">Loading settings...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
          API Key Management
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Bring Your Own Key (BYOK) for AI features.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="mr-2 w-5 h-5" /> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="mr-2 w-5 h-5" /> {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add or Update Key</CardTitle>
          <CardDescription>Select a provider and enter your API key to enable AI features.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-1.5">Provider</label>
              <select 
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-input px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 transition-all duration-200"
                value={formState.provider}
                onChange={(e) => setFormState({ ...formState, provider: e.target.value })}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <Input 
              label="API Key"
              type="password"
              required
              placeholder="sk-..."
              value={formState.key}
              onChange={(e) => setFormState({ ...formState, key: e.target.value })}
            />

            <Button type="submit" isLoading={saving} icon={Key} className="w-full sm:w-auto">
              {saving ? 'Validating...' : 'Save Key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Saved Keys</CardTitle>
          <CardDescription>Manage your connected AI providers.</CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 bg-[var(--bg-main)] rounded-xl border border-dashed border-[var(--border-color)]">
              <Key className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--text-muted)] font-medium">No API keys saved yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map(key => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={key.id} 
                  className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] group"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-[var(--text-main)]">{providers.find(p => p.id === key.provider)?.name || key.provider}</span>
                      {key.isValid ? (
                        <Badge variant="success">Valid</Badge>
                      ) : (
                        <Badge variant="error">Invalid</Badge>
                      )}
                      {defaultProvider === key.provider && (
                        <Badge variant="primary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 font-mono">{key.maskedKey}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    className="text-error hover:bg-error/10 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default APIKeySettings;
