import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type Tool = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
};

export default function ToolManagement() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  
  const handleAddTool = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };
  
  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };
  
  const handleDeleteTool = (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      setTools(tools.filter(t => t.id !== id));
    }
  };
  
  const handleSaveTool = (tool: Tool) => {
    if (editingTool) {
      setTools(tools.map(t => t.id === editingTool.id ? tool : t));
    } else {
      setTools([...tools, { ...tool, id: crypto.randomUUID() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Tool Management</h2>
        <button
          onClick={handleAddTool}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No tools registered yet</p>
          <p className="text-sm">Add your first tool using the button above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="p-4 border rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{tool.name}</h3>
                  <p className="text-gray-600 mt-1">{tool.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Endpoint: {tool.endpoint}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTool(tool)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-md"
                    title="Edit tool"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md"
                    title="Delete tool"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">
              {editingTool ? 'Edit Tool' : 'Add New Tool'}
            </h3>
            <ToolForm
              initialTool={editingTool}
              onSave={handleSaveTool}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolFormProps {
  initialTool: Tool | null;
  onSave: (tool: Tool) => void;
  onCancel: () => void;
}

function ToolForm({ initialTool, onSave, onCancel }: ToolFormProps) {
  const [form, setForm] = useState<Omit<Tool, 'id'>>({
    name: initialTool?.name || '',
    description: initialTool?.description || '',
    endpoint: initialTool?.endpoint || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialTool?.id || '',
      ...form,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tool Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endpoint
        </label>
        <input
          type="text"
          value={form.endpoint}
          onChange={e => setForm({ ...form, endpoint: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {initialTool ? 'Save Changes' : 'Add Tool'}
        </button>
      </div>
    </form>
  );
}