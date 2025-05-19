import React, { useState } from 'react';
import { Upload, Download, Save, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TemplateManager: React.FC = () => {
  const { 
    loadTemplate, 
    saveTemplate, 
    deleteTemplate, 
    templates,
    currentTemplate,
    setCurrentTemplate
  } = useAppContext();
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);

  const handleTemplateImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const template = JSON.parse(content);
        loadTemplate(template);
      } catch (error) {
        console.error('Error importing template:', error);
        alert('Invalid template file');
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateExport = () => {
    if (!currentTemplate) return;
    
    const templateJson = JSON.stringify(currentTemplate, null, 2);
    const blob = new Blob([templateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTemplate.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveNewTemplate = () => {
    if (!newTemplateName.trim()) return;
    
    saveTemplate({
      name: newTemplateName,
      prompts: [],
      metaPrompts: {
        h1: '',
        metaTitle: '',
        metaDescription: ''
      }
    });
    
    setNewTemplateName('');
    setShowNewTemplateForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Template Manager</h3>
        <div className="flex gap-2">
          <input
            type="file"
            id="template-import"
            className="hidden"
            accept=".json"
            onChange={handleTemplateImport}
          />
          <label
            htmlFor="template-import"
            className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </label>
          <button
            onClick={handleTemplateExport}
            disabled={!currentTemplate}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
              currentTemplate
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button
            onClick={() => setShowNewTemplateForm(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </button>
        </div>
      </div>

      {showNewTemplateForm && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Template name"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveNewTemplate}
            disabled={!newTemplateName.trim()}
            className="flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
          <button
            onClick={() => setShowNewTemplateForm(false)}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.name}
            className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
              currentTemplate?.name === template.name
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <button
              onClick={() => setCurrentTemplate(template)}
              className="flex-1 text-left"
            >
              <span className="font-medium text-gray-700">{template.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({template.prompts.length} prompts)
              </span>
            </button>
            <button
              onClick={() => deleteTemplate(template.name)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateManager;