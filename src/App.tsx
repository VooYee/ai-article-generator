import React from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import PromptManager from './components/PromptManager';
import APISettings from './components/APISettings';
import GenerateButton from './components/GenerateButton';
import ResultsSection from './components/ResultsSection';
import APILogs from './components/APILogs';
import InternalLinksManager from './components/InternalLinksManager';
import ArticleTemplateManager from './components/ArticleTemplateManager';
import { useAppContext } from './context/AppContext';

function App() {
  const { csvData, isGenerating } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - API Settings & Internal Links */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">API Settings</h2>
              <APISettings />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Article Template</h2>
              <ArticleTemplateManager />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Internal Links</h2>
              <InternalLinksManager />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Customize Prompts</h2>
              <PromptManager />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
              <APILogs />
            </section>
          </div>

          {/* Right Column - File Upload & Results */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Input Data</h2>
              <FileUpload />
            </section>

            {csvData && (
              <section className="text-center py-4">
                <GenerateButton />
              </section>
            )}

            {isGenerating && (
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Generation Progress</h2>
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                            In Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-teal-600">
                            Processing...
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                        <div 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                          style={{ width: '40%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <ResultsSection />
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-gray-500 text-sm mt-auto">
        <p>© 2025 AI Article Generator</p>
      </footer>
    </div>
  );
}

export default App;