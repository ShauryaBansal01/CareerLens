import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Trash2, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const APIKeySettings = () => {
  useEffect(() => { document.title = 'API Key Settings | CareerLens'; }, []);
  const { user } = useContext(AuthContext);
  const [keys, setKeys] = useState([]);
  const [defaultProvider, setDefaultProvider] = useState('gemini');
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ provider: 'gemini', key: '' });
  const [saving, setSaving] = useState(false);
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
      const { data } = await api.get(`/keys`, config);
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

    try {
      await api.post(`/keys`, formState, config);
      toast.success(`API Key for ${providers.find(p => p.id === formState.provider).name} saved!`);
      setFormState({ ...formState, key: '' });
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save API key.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This action cannot be undone. Are you sure you want to delete this API key?')) return;
    try {
      await api.delete(`/keys/${id}`, config);
      setKeys(keys.filter(k => k.id !== id));
      toast.success('API key deleted');
    } catch {
      toast.error('Failed to delete API key');
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="space-y-3 w-64"><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" /><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" /><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" /></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          API Key Management
        </h1>
        <p className="text-text-muted mt-2">Bring Your Own Key (BYOK) for AI features.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add or Update Key</CardTitle>
          <CardDescription>Select a provider and enter your API key to enable AI features.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="api-provider">Provider</label>
              <select
                id="api-provider"
                className="w-full bg-bg-card border border-border-color rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-accent-500 transition-colors"
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
            <div className="text-center py-8 bg-bg-main rounded-xl border border-dashed border-border-color">
              <Key className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-muted font-medium">No API keys saved yet. Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map(key => (
                <div 
                  key={key.id} 
                  className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-color"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-text-main">{providers.find(p => p.id === key.provider)?.name || key.provider}</span>
                      {key.isValid ? (
                        <Badge variant="success">Valid</Badge>
                      ) : (
                        <Badge variant="error">Invalid</Badge>
                      )}
                      {defaultProvider === key.provider && (
                        <Badge variant="primary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mt-1.5 font-mono">{key.maskedKey}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    className="text-error hover:bg-error/10 hover:text-error transition-opacity"
                    aria-label={`Delete ${providers.find(p => p.id === key.provider)?.name || key.provider} key`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeySettings;
