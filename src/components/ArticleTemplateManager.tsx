import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ArticleTemplateManager: React.FC = () => {
  const { currentTemplate, loadTemplate, updateTemplate } = useAppContext();

  const handleTemplateImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (fileExtension === 'json') {
          // Handle JSON template file
          const template = JSON.parse(content);
          loadTemplate(template);
        } else {
          // Handle HTML/text template file
          if (!currentTemplate) {
            alert('Please select or create a template first');
            return;
          }

          const updatedTemplate = {
            ...currentTemplate,
            template: {
              ...currentTemplate.template,
              content: content
            }
          };
          updateTemplate(updatedTemplate);
        }
      } catch (error) {
        console.error('Error importing template:', error);
        alert('Error importing template file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateExport = () => {
    if (!currentTemplate?.template?.content) {
      console.error('Invalid template structure:', currentTemplate);
      return;
    }
    
    const blob = new Blob([currentTemplate.template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTemplate.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <input
            type="file"
            id="template-import"
            className="hidden"
            accept=".html,.txt,.json"
            onChange={handleTemplateImport}
          />
          <label
            htmlFor="template-import"
            className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import Template
          </label>
          {currentTemplate && (
            <button
              onClick={handleTemplateExport}
              className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Template
            </button>
          )}
        </div>
      </div>

      {currentTemplate && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(currentTemplate.template.variables).map((variable) => (
                <div key={variable} className="text-sm text-gray-600">
                  {`{${variable}}`}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview:</h4>
            <pre className="text-xs overflow-auto max-h-[400px] p-2 bg-white rounded border">
              {currentTemplate.template.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleTemplateManager;