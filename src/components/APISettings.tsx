import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const APISettings: React.FC = () => {
  const { apiSettings, setApiSettings } = useAppContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiSettings(prev => ({
        ...prev,
        apiKey: savedApiKey
      }));
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiSettings({
      ...apiSettings,
      apiKey: e.target.value
    });
    setIsSaved(false);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setApiSettings({
      ...apiSettings,
      model: e.target.value
    });
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiSettings.apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
          OpenAI API Key
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="api-key"
            type={showApiKey ? "text" : "password"}
            value={apiSettings.apiKey}
            onChange={handleApiKeyChange}
            className="pl-10 pr-20 py-2 block w-full shadow-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="sk-..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 mr-2"
              onClick={toggleShowApiKey}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={saveApiKey}
              className={`px-3 py-1 rounded-md text-sm mr-2 ${
                isSaved 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your API key will be saved locally for future use
        </p>
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
          OpenAI Model
        </label>
        <select
          id="model"
          value={apiSettings.model}
          onChange={handleModelChange}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          <option value="gpt-4o-mini">GPT-4o-mini (Recommended)</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          GPT-4o-mini offers the best balance of quality and speed
        </p>
      </div>
    </div>
  );
};

export default APISettings