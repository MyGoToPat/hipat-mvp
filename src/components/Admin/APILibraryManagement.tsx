import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Pencil, Trash2 } from 'lucide-react';

type ApiLibrary = {
  id: string;
  name: string;
  provider: string;
  purpose: string | null;
  created_at: string;
};

export default function ApiLibraryManagement() {
  const empty: ApiLibrary = {
    id: '',
    name: '',
    provider: 'OpenAI',
    purpose: '',
    created_at: '',
  };

  const [libs, setLibs] = useState<ApiLibrary[]>([]);
  const [form, setForm] = useState<ApiLibrary>(empty);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchLibs();
  }, []);

  async function fetchLibs() {
    const { data } = await supabase
      .from('api_libraries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLibs(data as ApiLibrary[]);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveLib() {
    if (!form.name.trim()) return;
    const { error } = await supabase.from('api_libraries').upsert([
      {
        id: form.id || undefined,
        name: form.name,
        provider: form.provider,
        purpose: form.purpose,
      },
    ]);
    if (!error) {
      reset();
      fetchLibs();
    }
  }

  async function deleteLib(id: string) {
    const { error } = await supabase.from('api_libraries').delete().eq('id', id);
    if (!error) fetchLibs();
  }

  function editLib(lib: ApiLibrary) {
    setIsEdit(true);
    setForm(lib);
  }

  function reset() {
    setIsEdit(false);
    setForm(empty);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">API Library Management</h2>

      <div className="grid gap-2 md:grid-cols-3">
        <input
          name="name"
          placeholder="Library name"
          value={form.name}
          onChange={onChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <input
          name="provider"
          placeholder="Provider"
          value={form.provider}
          onChange={onChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <input
          name="purpose"
          placeholder="Purpose"
          value={form.purpose || ''}
          onChange={onChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <button 
        onClick={saveLib} 
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        {isEdit ? 'Update Library' : 'Save API Library'}
      </button>
      {isEdit && (
        <button 
          onClick={reset} 
          className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      )}

      <h3 className="mt-8 mb-2 font-medium">Available API Libraries</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Name</th>
            <th className="py-2 text-left">Provider</th>
            <th className="py-2 text-left">Purpose</th>
            <th className="py-2 text-left">Created</th>
            <th className="py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {libs.map((lib) => (
            <tr key={lib.id} className="border-b">
              <td className="py-1">{lib.name}</td>
              <td className="py-1">{lib.provider}</td>
              <td className="py-1">{lib.purpose}</td>
              <td className="py-1">{new Date(lib.created_at).toLocaleString()}</td>
              <td className="py-1 flex gap-2">
                <button onClick={() => editLib(lib)} title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteLib(lib.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}