import React from 'react';
import { Plus, Trash2, Pause, Play, Upload, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Papa from 'papaparse';

const PromptManager: React.FC = () => {
  const { 
    prompts = [], 
    addPrompt, 
    removePrompt, 
    updatePrompt,
    metaPrompts = { h1: '', metaTitle: '', metaDescription: '' }, 
    setMetaPrompts,
    setPrompts,
    isGenerating,
    isPaused,
    pauseGeneration,
    resumeGeneration
  } = useAppContext();

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Array<Record<string, string>>;
          if (data.length > 0) {
            const row = data[0];
            
            // Update meta prompts
            const newMetaPrompts = {
              h1: row.h1 || '',
              metaTitle: row.metaTitle || '',
              metaDescription: row.metaDescription || ''
            };
            setMetaPrompts(newMetaPrompts);

            // Update paragraph prompts
            const newPrompts: string[] = [];
            for (let i = 1; i <= 10; i++) {
              const key = `paragraph_${i}`;
              if (row[key]) {
                newPrompts.push(row[key]);
              }
            }
            setPrompts(newPrompts);
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          alert('Error importing CSV. Please check the format.');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error reading CSV file. Please check the file format.');
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const handleTemplateExport = () => {
    const csvData = [{
      h1: metaPrompts.h1,
      metaTitle: metaPrompts.metaTitle,
      metaDescription: metaPrompts.metaDescription,
      ...prompts.reduce((acc, content, index) => ({
        ...acc,
        [`paragraph_${index + 1}`]: content
      }), {})
    }];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 text-sm">
          Create prompts for your article content. Use variables like {'{{'}<span className="font-mono">variable</span>{'}}'}  to insert data from your CSV.
        </p>
        <div className="flex gap-2">
          {isGenerating && (
            <button
              onClick={isPaused ? resumeGeneration : pauseGeneration}
              className={`flex items-center text-sm px-3 py-1.5 rounded-md transition-colors ${
                isPaused 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              )}
            </button>
          )}
          <input
            type="file"
            id="csv-import"
            className="hidden"
            accept=".csv"
            onChange={handleCSVImport}
          />
          <label
            htmlFor="csv-import"
            className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </label>
          <button
            onClick={handleTemplateExport}
            className="flex items-center text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button
            onClick={addPrompt}
            className="flex items-center text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Meta Content Prompts</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">H1 Title Prompt</label>
              <textarea
                value={metaPrompts.h1}
                onChange={(e) => setMetaPrompts(prev => ({ ...prev, h1: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm"
                placeholder="Write instructions for generating the H1 title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title Prompt</label>
              <textarea
                value={metaPrompts.metaTitle}
                onChange={(e) => setMetaPrompts(prev => ({ ...prev, metaTitle: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm"
                placeholder="Write instructions for generating the meta title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description Prompt</label>
              <textarea
                value={metaPrompts.metaDescription}
                onChange={(e) => setMetaPrompts(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm"
                placeholder="Write instructions for generating the meta description"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Content Prompts</h3>
          <div className="space-y-4">
            {prompts.map((prompt, index) => (
              <div key={index} className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => updatePrompt(index, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[120px] text-sm pr-8"
                  placeholder={`Write template for paragraph ${index + 1}`}
                />
                <button
                  onClick={() => removePrompt(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={addPrompt}
          className="flex items-center mx-auto text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Another Prompt
        </button>
      </div>
    </div>
  );
};

export default PromptManager;