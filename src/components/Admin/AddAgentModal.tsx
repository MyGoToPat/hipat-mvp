import { useState } from 'react';
import { Bot, X, BookOpen, MessageSquare, Mic, ImageIcon, Crown, Users } from 'lucide-react';
import { Database } from '../../lib/supabase-types';

type AgentsRow = Database['public']['Tables']['agents'];
type AgentCategory = 'Nutrition' | 'Fitness' | 'Feedback' | 'General';
type ContextWindow = 'Short' | 'Medium' | 'Long';
type Priority = 'Primary' | 'Secondary' | 'Tertiary';
type Status = 'dev' | 'beta' | 'live';
type InputType = 'text' | 'voice' | 'photo';
type AgentRole = 'Primary' | 'Support' | 'Coordinator';

interface APILibrary {
  id: string;
  name: string;
  provider: string;
}

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (agent: Partial<AgentsRow>) => Promise<void>;
  availableApiLibraries: APILibrary[];
  availableCategories: { id: string; name: string; description?: string }[];
}

const AddAgentModal = ({
  open,
  onClose,
  onSubmit,
  availableApiLibraries,
  availableCategories
}: AddAgentModalProps) => {
  const [form, setForm] = useState<Partial<AgentsRow>>({
    name: '',
    role: 'Primary',
    category: 'General',
    description: '',
    prompt: '',
    default_api_model: '',
    assistant_id: '',
    tools_json: [],
    token_budget: 1000,
    memory_flags: {},
    input_types: ['text'],
    free_access: true,
    premium_access: false,
    status: 'dev',
    version: ''
  });
  
  // String states for JSON fields
  const [toolsJsonStr, setToolsJsonStr] = useState('[]');
  const [memoryFlagsStr, setMemoryFlagsStr] = useState('{}');
  
  // Input fields
  const [knowledgeBaseInput, setKnowledgeBaseInput] = useState('');
  const [triggerKeywordInput, setTriggerKeywordInput] = useState('');
  
  // Error handling
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateForm = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
    // Clear error for this field if it exists
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };
  
  const handleToolsJsonChange = (value: string) => {
    setToolsJsonStr(value);
    try {
      const parsed = JSON.parse(value);
      updateForm('tools_json', parsed);
    } catch (error) {
      // Allow invalid JSON during editing, but track the error
      setErrors({ ...errors, tools_json: 'Invalid JSON' });
    }
  };
  
  const handleMemoryFlagsChange = (value: string) => {
    setMemoryFlagsStr(value);
    try {
      const parsed = JSON.parse(value);
      updateForm('memory_flags', parsed);
    } catch (error) {
      // Allow invalid JSON during editing, but track the error
      setErrors({ ...errors, memory_flags: 'Invalid JSON' });
    }
  };
  
  // Handle knowledge base input
  const handleAddKnowledgeBase = () => {
    if (knowledgeBaseInput.trim()) {
      const currentKnowledgeBase = form.knowledge_base || [];
      updateForm('knowledge_base', [...currentKnowledgeBase, knowledgeBaseInput.trim()]);
      setKnowledgeBaseInput('');
    }
  };
  
  const handleRemoveKnowledgeBase = (index: number) => {
    if (form.knowledge_base) {
      updateForm('knowledge_base', form.knowledge_base.filter((_, i) => i !== index));
    }
  };
  
  // Handle trigger keywords input
  const handleAddTriggerKeyword = () => {
    if (triggerKeywordInput.trim()) {
      const currentTriggerKeywords = form.trigger_keywords || [];
      updateForm('trigger_keywords', [...currentTriggerKeywords, triggerKeywordInput.trim()]);
      setTriggerKeywordInput('');
    }
  };
  
  const handleRemoveTriggerKeyword = (index: number) => {
    if (form.trigger_keywords) {
      updateForm('trigger_keywords', form.trigger_keywords.filter((_, i) => i !== index));
    }
  };
  
  // Handle input type toggle
  const handleInputTypeToggle = (type: InputType) => {
    const currentInputTypes = form.input_types as InputType[] || [];
    if (currentInputTypes.includes(type)) {
      updateForm('input_types', currentInputTypes.filter(t => t !== type));
    } else {
      updateForm('input_types', [...currentInputTypes, type]);
    }
  };
  
  // Handle API model selection
  const handleApiModelToggle = (id: string) => {
    const currentLinkedModels = form.linked_api_models || [];
    if (currentLinkedModels.includes(id)) {
      updateForm('linked_api_models', currentLinkedModels.filter(modelId => modelId !== id));
    } else {
      updateForm('linked_api_models', [...currentLinkedModels, id]);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setForm({
      name: '',
      role: 'Primary',
      category: 'General',
      description: '',
      prompt: '',
      default_api_model: '',
      assistant_id: '',
      tools_json: [],
      token_budget: 1000,
      memory_flags: {},
      input_types: ['text'],
      free_access: true,
      premium_access: false,
      status: 'dev',
      version: ''
    });
    setToolsJsonStr('[]');
    setMemoryFlagsStr('{}');
    setKnowledgeBaseInput('');
    setTriggerKeywordInput('');
    setErrors({});
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.description) newErrors.description = 'Description is required';
    
    // Validate JSON fields
    try {
      JSON.parse(toolsJsonStr);
    } catch (error) {
      newErrors.tools_json = 'Invalid JSON format';
    }
    
    try {
      JSON.parse(memoryFlagsStr);
    } catch (error) {
      newErrors.memory_flags = 'Invalid JSON format';
    }
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Treat empty assistant_id as null
      if (form.assistant_id === '') form.assistant_id = null;
      
      await onSubmit(form);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating agent:', error);
      setErrors({ submit: 'Failed to create agent' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Add New Agent</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          {/* Error message for submission */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
              {errors.submit}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-1">Basic Information</h3>
              
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className={`w-full rounded-md border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                  placeholder="Enter agent name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              
              {/* Agent Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role as string}
                  onChange={(e) => updateForm('role', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="Primary">Primary (Main agent execution)</option>
                  <option value="Support">Support (Assists primary agents)</option>
                  <option value="Coordinator">Coordinator (Manages agent swarms)</option>
                </select>
              </div>
              
              {/* Agent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category as string}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status as string}
                  onChange={(e) => updateForm('status', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="dev">Development</option>
                  <option value="beta">Beta</option>
                  <option value="live">Live</option>
                </select>
              </div>
              
              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={form.version as string}
                  onChange={(e) => updateForm('version', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., 1.0.0"
                />
              </div>
              
              {/* Assistant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant ID
                  <span className="ml-1 text-xs text-gray-500">(OpenAI Assistant ID)</span>
                </label>
                <input
                  type="text"
                  value={form.assistant_id as string || ''}
                  onChange={(e) => updateForm('assistant_id', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter OpenAI assistant ID"
                />
              </div>
              
              {/* Token Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Budget
                  <span className="ml-1 text-xs text-gray-500">(Max tokens per conversation)</span>
                </label>
                <input
                  type="number"
                  value={form.token_budget as number || 0}
                  onChange={(e) => updateForm('token_budget', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter token budget"
                />
              </div>
            </div>
            
            {/* Right column - API Settings & Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-1">API Settings & Configuration</h3>
              
              {/* Linked API Models */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked API Models <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-32 overflow-y-auto">
                  {availableApiLibraries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {availableApiLibraries.map((library) => (
                        <div key={library.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`api-${library.id}`}
                            checked={(form.linked_api_models || []).includes(library.id)}
                            onChange={() => handleApiModelToggle(library.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`api-${library.id}`} className="ml-2 block text-sm text-gray-900">
                            {library.name} ({library.provider})
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No API libraries found. Please add some in the API Library Management section.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Default API Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default API Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.default_api_model as string || ''}
                  onChange={(e) => updateForm('default_api_model', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  disabled={(form.linked_api_models || []).length === 0}
                >
                  <option value="" disabled>Select default API model</option>
                  {(form.linked_api_models || []).map(id => {
                    const library = availableApiLibraries.find(lib => lib.id === id);
                    return library ? (
                      <option key={id} value={id}>
                        {library.name} ({library.provider})
                      </option>
                    ) : null;
                  })}
                </select>
                {(form.linked_api_models || []).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one linked API model first</p>
                )}
              </div>
              
              {/* Input Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Types <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputTypeToggle('text')}
                    className={`flex items-center px-3 py-2 rounded-md border ${
                      (form.input_types || []).includes('text')
                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputTypeToggle('voice')}
                    className={`flex items-center px-3 py-2 rounded-md border ${
                      (form.input_types || []).includes('voice')
                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputTypeToggle('photo')}
                    className={`flex items-center px-3 py-2 rounded-md border ${
                      (form.input_types || []).includes('photo')
                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </button>
                </div>
                {(form.input_types || []).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Select at least one input type</p>
                )}
              </div>
              
              {/* Tier Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier Access <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="freeAccess"
                      checked={form.free_access}
                      onChange={(e) => updateForm('free_access', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="freeAccess" className="ml-2 flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-1 text-gray-600" />
                      Free Tier
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="premiumAccess"
                      checked={form.premium_access}
                      onChange={(e) => updateForm('premium_access', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="premiumAccess" className="ml-2 flex items-center text-sm text-gray-900">
                      <Crown className="w-4 h-4 mr-1 text-gray-600" />
                      Premium Tier
                    </label>
                  </div>
                </div>
                {!form.free_access && !form.premium_access && (
                  <p className="text-xs text-red-500 mt-1">Select at least one tier</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Full width fields */}
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-gray-700 border-b pb-1">Agent Behavior</h3>
            
            {/* Agent Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description as string}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={2}
                className={`w-full rounded-md border ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                placeholder="Describe what this agent does"
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
            
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-500">(Instructions defining agent behavior)</span>
              </label>
              <textarea
                value={form.prompt as string || ''}
                onChange={(e) => updateForm('prompt', e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Enter detailed instructions for the agent behavior"
              />
            </div>
            
            {/* Tools JSON */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tools JSON
                <span className="ml-1 text-xs text-gray-500">(Available tools for this agent)</span>
              </label>
              <textarea
                value={toolsJsonStr}
                onChange={(e) => handleToolsJsonChange(e.target.value)}
                rows={3}
                className={`w-full rounded-md border ${errors.tools_json ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                placeholder='[{"type":"code_interpreter"}, {"type":"retrieval"}]'
              />
              {errors.tools_json && <p className="mt-1 text-xs text-red-500">{errors.tools_json}</p>}
              <p className="text-xs text-gray-500 mt-1">Enter a valid JSON array of tool objects</p>
            </div>
            
            {/* Memory Flags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory Flags
                <span className="ml-1 text-xs text-gray-500">(Memory configuration for this agent)</span>
              </label>
              <textarea
                value={memoryFlagsStr}
                onChange={(e) => handleMemoryFlagsChange(e.target.value)}
                rows={2}
                className={`w-full rounded-md border ${errors.memory_flags ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500`}
                placeholder='{"persist_session":true,"retain_context":true}'
              />
              {errors.memory_flags && <p className="mt-1 text-xs text-red-500">{errors.memory_flags}</p>}
              <p className="text-xs text-gray-500 mt-1">Enter a valid JSON object with memory configuration flags</p>
            </div>
            
            {/* Knowledge Base */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Knowledge Base
                <span className="ml-1 text-xs text-gray-500">(Optional)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={knowledgeBaseInput}
                  onChange={(e) => setKnowledgeBaseInput(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Add doc link, PDF URL, or video code"
                />
                <button
                  type="button"
                  onClick={handleAddKnowledgeBase}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              {(form.knowledge_base || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.knowledge_base || []).map((item, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                      <BookOpen className="w-4 h-4 mr-1 text-gray-600" />
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKnowledgeBase(index)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Trigger Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Keywords
                <span className="ml-1 text-xs text-gray-500">(Optional)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={triggerKeywordInput}
                  onChange={(e) => setTriggerKeywordInput(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Add agent-specific trigger phrase"
                />
                <button
                  type="button"
                  onClick={handleAddTriggerKeyword}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              {(form.trigger_keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.trigger_keywords || []).map((keyword, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                      <span className="text-sm">{keyword}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTriggerKeyword(index)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 flex items-center"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;