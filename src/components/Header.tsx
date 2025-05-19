import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center">
        <FileText className="mr-3 h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">AI Article Generator</h1>
          <p className="text-teal-100 text-sm">Generate SEO-optimized HTML articles from CSV data</p>
        </div>
      </div>
    </header>
  );
};

export default Header;