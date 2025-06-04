import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';
import { Database } from '../../lib/supabase-types';
import { useUserStore } from '../../lib/store';
import { Bot, Plus, Check, Search, Filter, AlertCircle, Info, BookOpen, Cpu, List, ToggleLeft, ToggleRight, Eye, EyeOff, ImageIcon, Mic, MessageSquare, Crown, Users, Edit, Trash2, Tags } from 'lucide-react';
import AddAgentModal from './AddAgentModal';
import EditAgentModal from './EditAgentModal';
import toast from 'react-hot-toast';

type AgentsRow = Database['public']['Tables']['agents'];
type AgentCategory = 'Nutrition' | 'Fitness' | 'Feedback' | 'General';
type ContextWindow = 'Short' | 'Medium' | 'Long';
type Priority = 'Primary' | 'Secondary' | 'Tertiary';
type Status = 'dev' | 'beta' | 'live';
type InputType = 'text' | 'voice' | 'photo';
type AgentRole = 'Primary' | 'Support' | 'Coordinator';
type ModelProvider = 'OpenAI GPT' | 'Claude' | 'DeepSeek' | 'Lemonade';

interface APILibrary {
  id: string;
  name: string;
  provider: string;
}

interface AgentCategoryItem {
  id: string;
  name: string;
  description?: string;
}

interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  category?: AgentCategory;
  description: string;
  prompt?: string;
  default_api_model?: string;
  knowledge_base?: string[];
  context_window?: ContextWindow;
  priority?: Priority;
  trigger_keywords?: string[];
  linked_api_models?: string[];
  input_types?: InputType[];
  free_access?: boolean;
  premium_access?: boolean;
  status?: Status;
  version?: string;
  created_at: string;
  assistant_id?: string;
  tools_json?: any;
  token_budget?: number;
  memory_flags?: any;
  swarm_group?: string;
}

const AgentManagement: React.FC = () => {
  const { user } = useUserStore();
  
  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole>('Primary');
  const [category, setCategory] = useState<AgentCategory>('General');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [defaultApiModel, setDefaultApiModel] = useState<string>('');
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [knowledgeBaseInput, setKnowledgeBaseInput] = useState('');
  const [contextWindow, setContextWindow] = useState<ContextWindow | undefined>(undefined);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [triggerKeywordInput, setTriggerKeywordInput] = useState('');
  const [linkedApiModels, setLinkedApiModels] = useState<string[]>([]);
  const [availableApiLibraries, setAvailableApiLibraries] = useState<APILibrary[]>([]);
  const [availableCategories, setAvailableCategories] = useState<AgentCategoryItem[]>([]);
  const [inputTypes, setInputTypes] = useState<InputType[]>(['text']);
  const [freeAccess, setFreeAccess] = useState(true);
  const [premiumAccess, setPremiumAccess] = useState(false);
  const [status, setStatus] = useState<Status>('dev');
  const [version, setVersion] = useState('');
  
  // New fields
  const [assistantId, setAssistantId] = useState('');
  const [toolsJson, setToolsJson] = useState('');
  const [tokenBudget, setTokenBudget] = useState<number>(0);
  const [memoryFlags, setMemoryFlags] = useState('');
  const [swarmGroup, setSwarmGroup] = useState<string>('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const [swarmFilter, setSwarmFilter] = useState<string | 'all'>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
    fetchApiLibraries();
    fetchAgentCategories();
  }, []);
  
  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Apply role filter if selected
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      
      // Apply swarm filter if selected
      if (swarmFilter !== 'all') {
        if (swarmFilter === 'unassigned') {
          query = query.is('swarm_group', null);
        } else {
          query = query.eq('swarm_group', swarmFilter);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error(`Failed to fetch agents: ${error.message}`);
        throw error;
      }
      
      setAgents(data as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setErrorMessage('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiLibraries = async () => {
    try {
      const { data, error } = await supabase
        .from('api_libraries')
        .select('id, name, provider')
        .order('name', { ascending: true });
      
      if (error) {
        toast.error(`API-library fetch error: ${error.message}`);
        throw error;
      }
      
      setAvailableApiLibraries(data as APILibrary[]);
    } catch (error) {
      console.error('Error fetching API libraries:', error);
    }
  };

  // --- dev helper: seed one library if none exist ------------
  useEffect(() => {
    if (import.meta.env.DEV) {
      (async () => {
        const { data } = await supabase.from('api_libraries').select('id').limit(1);
        if (!data?.length) {
          await supabase.from('api_libraries').insert({
            name: 'openai_chat_test',
            provider: 'OpenAI',
            api_key: 'sk-PLACEHOLDER',
            purpose: ['chat']
          });
        }
        fetchApiLibraries();
      })();
    } else {
      fetchApiLibraries();
    }
  }, []);

  const fetchAgentCategories = async () => {
    try {
      // Try to fetch from agent_categories table if it exists
      const { data, error } = await supabase
        .from('agent_categories')
        .select('id, name, description')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching agent categories:', error);
        // Fallback to hardcoded categories
        setAvailableCategories([
          { id: '1', name: 'Nutrition', description: 'Diet and food-related agents' },
          { id: '2', name: 'Fitness', description: 'Exercise and workout-related agents' },
          { id: '3', name: 'Feedback', description: 'User feedback collection agents' },
          { id: '4', name: 'General', description: 'General purpose assistants' }
        ]);
      } else {
        setAvailableCategories(data as AgentCategoryItem[]);
      }
    } catch (error) {
      console.error('Error fetching agent categories:', error);
      // Fallback to hardcoded categories
      setAvailableCategories([
        { id: '1', name: 'Nutrition', description: 'Diet and food-related agents' },
        { id: '2', name: 'Fitness', description: 'Exercise and workout-related agents' },
        { id: '3', name: 'Feedback', description: 'User feedback collection agents' },
        { id: '4', name: 'General', description: 'General purpose assistants' }
      ]);
    }
  };
  
  // Apply filters
  useEffect(() => {
    fetchAgents();
  }, [roleFilter, swarmFilter]);
  
  // Get unique swarm groups for filtering
  const getUniqueSwarmGroups = (): string[] => {
    const groups = agents
      .map(agent => agent.swarm_group)
      .filter((group): group is string => !!group);
    return [...new Set(groups)];
  };

  // Update the available default API models when linked models change
  useEffect(() => {
    if (linkedApiModels.length > 0 && !linkedApiModels.includes(defaultApiModel)) {
      // Set the first linked model as the default if the current default is not in the linked models
      setDefaultApiModel(linkedApiModels[0]);
    } else if (linkedApiModels.length === 0) {
      setDefaultApiModel('');
    }
  }, [linkedApiModels, defaultApiModel]);
  
  // Handle knowledge base input
  const handleAddKnowledgeBase = () => {
    if (knowledgeBaseInput.trim()) {
      setKnowledgeBase([...knowledgeBase, knowledgeBaseInput.trim()]);
      setKnowledgeBaseInput('');
    }
  };
  
  const handleRemoveKnowledgeBase = (index: number) => {
    setKnowledgeBase(knowledgeBase.filter((_, i) => i !== index));
  };
  
  // Handle trigger keywords input
  const handleAddTriggerKeyword = () => {
    if (triggerKeywordInput.trim()) {
      setTriggerKeywords([...triggerKeywords, triggerKeywordInput.trim()]);
      setTriggerKeywordInput('');
    }
  };
  
  const handleRemoveTriggerKeyword = (index: number) => {
    setTriggerKeywords(triggerKeywords.filter((_, i) => i !== index));
  };
  
  // Handle input type toggle
  const handleInputTypeToggle = (type: InputType) => {
    if (inputTypes.includes(type)) {
      setInputTypes(inputTypes.filter(t => t !== type));
    } else {
      setInputTypes([...inputTypes, type]);
    }
  };
  
  // Handle API model selection
  const handleApiModelToggle = (id: string) => {
    if (linkedApiModels.includes(id)) {
      setLinkedApiModels(linkedApiModels.filter(modelId => modelId !== id));
    } else {
      setLinkedApiModels([...linkedApiModels, id]);
    }
  };
  
  const resetForm = () => {
    setName('');
    setRole('Primary');
    setCategory('General');
    setDescription('');
    setPrompt('');
    setDefaultApiModel('');
    setKnowledgeBase([]);
    setContextWindow(undefined);
    setPriority(undefined);
    setTriggerKeywords([]);
    setLinkedApiModels([]);
    setInputTypes(['text']);
    setFreeAccess(true);
    setPremiumAccess(false);
    setStatus('dev');
    setVersion('');
    setAssistantId('');
    setToolsJson('');
    setTokenBudget(0);
    setMemoryFlags('');
    setSwarmGroup('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !role.trim() || !description.trim()) {
      setErrorMessage('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Parse JSON fields
      let parsedToolsJson;
      let parsedMemoryFlags;
      
      try {
        parsedToolsJson = toolsJson ? JSON.parse(toolsJson) : [];
      } catch (error) {
        throw new Error("Tools JSON is not valid JSON");
      }
      
      try {
        parsedMemoryFlags = memoryFlags ? JSON.parse(memoryFlags) : {};
      } catch (error) {
        throw new Error("Memory flags is not valid JSON");
      }
      
      const agentData = {
        name,
        role,
        category,
        description,
        prompt,
        default_api_model: defaultApiModel || null,
        knowledge_base: knowledgeBase.length > 0 ? knowledgeBase : null,
        context_window: contextWindow || null,
        priority: priority || null,
        trigger_keywords: triggerKeywords.length > 0 ? triggerKeywords : null,
        linked_api_models: linkedApiModels.length > 0 ? linkedApiModels : null,
        input_types: inputTypes,
        free_access: freeAccess,
        premium_access: premiumAccess,
        status,
        version: version.trim() || null,
        created_by: user?.id,
        // New fields
        assistant_id: assistantId.trim() || null,
        tools_json: parsedToolsJson,
        token_budget: tokenBudget,
        memory_flags: parsedMemoryFlags,
        swarm_group: swarmGroup.trim() || null
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Reset form
      resetForm();
      
      setSuccessMessage('Agent created successfully!');
      
      // Refresh agent list
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      setErrorMessage('Failed to create agent: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for agent creation via modal
  const handleCreateAgent = async (agent: Partial<AgentsRow>) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Add user id
      const agentData = {
        ...agent,
        created_by: user?.id
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select();
        
      if (error) {
        throw error;
      }
      
      setSuccessMessage('Agent created successfully!');
      
      // Refresh agent list
      fetchAgents();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating agent:', error);
      setErrorMessage('Failed to create agent: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for selecting an agent to edit
  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditModalOpen(true);
  };

  // Handler for closing edit modal and refreshing agent list
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedAgent(null);
    fetchAgents(); // Refresh agents list after editing
    setSuccessMessage('Agent updated successfully!');
  };

  // Handler for deleting an agent
  const handleDeleteAgent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering row click (edit)
    
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Agent deleted successfully');
      fetchAgents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  // Get the selected API library details by id
  const getApiLibraryById = (id: string) => {
    return availableApiLibraries.find(lib => lib.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-medium">Agent Management</h2>
          </div>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Agent
          </button>
        </div>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}
        
        {/* 
          Traditional form is kept but hidden in case you want to switch back
          You can remove this comment block if not needed
        */}
        <form onSubmit={handleSubmit} className="hidden space-y-6">
          {/* Form content is hidden */}
        </form>
      </div>
      
      {/* Agent List */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Available Agents</h3>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as AgentRole | 'all')}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="Primary">Primary</option>
                <option value="Support">Support</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
            
            {/* Swarm Filter - New */}
            <div className="flex items-center space-x-2">
              <Tags className="w-4 h-4 text-gray-500" />
              <select
                value={swarmFilter}
                onChange={(e) => setSwarmFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Swarms</option>
                <option value="unassigned">Unassigned</option>
                {getUniqueSwarmGroups().map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg">No agents found</p>
            <p className="text-sm">Create your first agent using the "Add Agent" button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default API
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assistant ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Swarm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr 
                    key={agent.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleEditAgent(agent)}>
                      <div className="flex items-center">
                        <Bot className="w-5 h-5 text-primary-600 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleEditAgent(agent)}>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => handleEditAgent(agent)}>
                      {agent.default_api_model ? 
                        getApiLibraryById(agent.default_api_model)?.name || 'Unknown' 
                        : agent.provider || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => handleEditAgent(agent)}>
                      {agent.assistant_id ? agent.assistant_id.substring(0, 8) + '...' : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => handleEditAgent(agent)}>
                      {agent.token_budget || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={() => handleEditAgent(agent)}>
                      {agent.swarm_group ? (
                        <div className="flex items-center text-primary-600">
                          <Tags className="w-4 h-4 mr-1" />
                          <span>{agent.swarm_group}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => handleEditAgent(agent)}>
                      {new Date(agent.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAgent(agent)}
                          className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-1 rounded"
                          title="Edit agent"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteAgent(agent.id, e)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          title="Delete agent"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Agent Modal */}
      <AddAgentModal 
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateAgent}
        availableApiLibraries={availableApiLibraries}
        availableCategories={availableCategories}
      />
      
      {/* Edit Agent Modal */}
      {selectedAgent && (
        <EditAgentModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          agent={selectedAgent as AgentsRow}
          availableApiLibraries={availableApiLibraries}
          availableCategories={availableCategories}
        />
      )}
    </div>
  );
};

export default AgentManagement;