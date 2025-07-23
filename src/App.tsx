import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import PromptManager from "./components/PromptManager";
import APISettings from "./components/APISettings";
import GenerateButton from "./components/GenerateButton";
import ResultsSection from "./components/ResultsSection";
import APILogs from "./components/APILogs";
import InternalLinksManager from "./components/InternalLinksManager";
import ArticleTemplateManager from "./components/ArticleTemplateManager";
import { useAppContext } from "./context/AppContext";

function App() {
  const { csvData, isGenerating, progressCurrent, progressTotal } =
    useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Settings & Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                API Settings
              </h2>
              <APISettings />
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                Article Template
              </h2>
              <ArticleTemplateManager />
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                Internal Links
              </h2>
              <InternalLinksManager />
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                Content Prompts
              </h2>
              <PromptManager />
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <APILogs />
            </section>
          </div>

          {/* Right Column - File Upload & Results */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <div className="w-2 h-6 bg-teal-500 rounded-full mr-3"></div>
                Upload CSV Data
              </h2>
              <FileUpload />
            </section>

            {csvData && (
              <section className="text-center py-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <GenerateButton />
                </div>
              </section>
            )}

            {isGenerating && (
              <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></div>
                  Generation Progress
                </h2>
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
                            {progressCurrent} / {progressTotal} articles
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-teal-200">
                        <div
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{
                            width:
                              progressTotal > 0
                                ? `${(progressCurrent / progressTotal) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                      {progressTotal > 0 && (
                        <div className="text-center">
                          <span className="text-sm text-gray-600">
                            {Math.round(
                              (progressCurrent / progressTotal) * 100
                            )}
                            % complete
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <ResultsSection />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-gray-500 text-sm mt-auto border-t border-gray-200 bg-white">
        <p>© 2025 AI Article Generator • Streamline your content creation</p>
      </footer>
    </div>
  );
}

export default App;
