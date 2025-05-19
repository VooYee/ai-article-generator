import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Template } from '../types/template';
import { validateTemplate } from '../utils/templateUtils';

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
  const [editedTemplate, setEditedTemplate] = useState<string>(
    JSON.stringify(template, null, 2)
  );
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editedTemplate);
      if (validateTemplate(parsed)) {
        onSave(parsed);
        setError('');
      } else {
        setError('Invalid template format');
      }
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Edit Template</h3>
        <button
          onClick={handleSave}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </button>
      </div>

      <textarea
        value={editedTemplate}
        onChange={(e) => setEditedTemplate(e.target.value)}
        className="w-full h-[500px] font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TemplateEditor;