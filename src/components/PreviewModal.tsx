import React from 'react';
import { X } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    h1: string;
    metaTitle: string;
    metaDescription: string;
    fullArticle: string;
  };
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, article }) => {
  console.log('PreviewModal - article:', article);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Article Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Meta Title</h4>
              <p className="text-gray-900">{article.metaTitle}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Meta Description</h4>
              <p className="text-gray-900">{article.metaDescription}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Article Content</h4>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.fullArticle }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;