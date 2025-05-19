import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const GenerateButton: React.FC = () => {
  const { 
    prompts, 
    csvData, 
    apiSettings, 
    isGenerating, 
    generateArticles,
    currentTemplate 
  } = useAppContext();

  const isDisabled = 
    isGenerating || 
    !csvData || 
    prompts.length === 0 || 
    !apiSettings.apiKey ||
    !currentTemplate;

  const getButtonMessage = () => {
    if (!csvData) return 'Upload a CSV file first';
    if (prompts.length === 0) return 'Add at least one prompt';
    if (!apiSettings.apiKey) return 'Enter an OpenAI API key';
    if (!currentTemplate) return 'Select a template';
    return 'Generate Articles';
  };

  const handleClick = () => {
    if (!isDisabled) {
      generateArticles();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          flex items-center px-6 py-3 rounded-md text-white font-medium shadow-sm transform transition-all
          ${isDisabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-70' 
            : 'bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98]'}
        `}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        {isGenerating ? 'Generating...' : getButtonMessage()}
      </button>

      {isDisabled && !isGenerating && (
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{getButtonMessage()}</span>
        </div>
      )}

      {!isDisabled && !isGenerating && csvData && (
        <div className="mt-2 text-sm text-gray-500">
          This will generate content for {csvData.rows.length} articles
        </div>
      )}
    </div>
  );
};

export default GenerateButton;