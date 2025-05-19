import React, { useState } from 'react';
import { Upload, Download, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Papa from 'papaparse';

const ParagraphTemplateManager: React.FC = () => {
  const { prompts, setPrompts, metaPrompts, setMetaPrompts } = useAppContext();

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as Array<any>;
          if (data.length > 0) {
            // Assuming CSV has columns: type, content
            const newPrompts: string[] = [];
            let newMetaPrompts = { ...metaPrompts };

            data.forEach((row: any) => {
              if (!row.type || !row.content) return;

              switch (row.type.toLowerCase()) {
                case 'h1':
                  newMetaPrompts.h1 = row.content;
                  break;
                case 'meta_title':
                  newMetaPrompts.metaTitle = row.content;
                  break;
                case 'meta_description':
                  newMetaPrompts.metaDescription = row.content;
                  break;
                case 'paragraph':
                  newPrompts.push(row.content);
                  break;
              }
            });

            setPrompts(newPrompts);
            setMetaPrompts(newMetaPrompts);
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error importing CSV. Please check the format.');
        }
      },
      header: true,
      skipEmptyLines: true
    });
  };

  const handleTemplateExport = () => {
    // Create CSV data
    const csvData = [
      { type: 'h1', content: metaPrompts.h1 },
      { type: 'meta_title', content: metaPrompts.metaTitle },
      { type: 'meta_description', content: metaPrompts.metaDescription },
      ...prompts.map((content, index) => ({
        type: 'paragraph',
        content
      }))
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paragraph-templates.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addPrompt = () => {
    setPrompts([...prompts, '']);
  };

  const removePrompt = (index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <input
            type="file"
            id="csv-import"
            className="hidden"
            accept=".csv"
            onChange={handleCSVImport}
          />
          <label
            htmlFor="csv-import"
            className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import CSV
          </label>
          <button
            onClick={handleTemplateExport}
            className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Meta Content Templates</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">H1 Title Template</label>
              <textarea
                value={metaPrompts.h1}
                onChange={(e) => setMetaPrompts(prev => ({ ...prev, h1: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm"
                placeholder="Write instructions for generating the H1 title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title Template</label>
              <textarea
                value={metaPrompts.metaTitle}
                onChange={(e) => setMetaPrompts(prev => ({ ...prev, metaTitle: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm"
                placeholder="Write instructions for generating the meta title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description Template</label>
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
          <h3 className="font-medium text-gray-700">Content Templates</h3>
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
          Add Template
        </button>
      </div>
    </div>
  );
};

export default ParagraphTemplateManager;