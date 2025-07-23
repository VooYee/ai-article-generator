import React, { createContext, useContext, useState, useEffect } from "react";
import { apiQueue, setQueuePaused, isQueuePaused } from "../utils/queue";
import { cleanText, cleanHtml, compactParagraphs } from "../utils/textUtils";
import { generateInternalLinks } from "../utils/templateUtils";
import defaultTemplate from "../templates/plumbing-template.json";

type CSVData = {
  headers: string[];
  rows: Record<string, string>[];
};

type APISettingsType = {
  apiKey: string;
  model: string;
};

type APILog = {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  error?: string;
  duration: number;
};

type MetaPrompts = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
};

type Template = {
  name: string;
  prompts: string[];
  metaPrompts: MetaPrompts;
  template?: {
    content?: string;
    variables?: Record<string, string>;
    internalLinks?: {
      enabled: boolean;
      maxLinks: number;
      linkFormat: string;
      titleFormat: string;
      groupBy: string;
      filterBy?: string[];
    };
  };
};

type GeneratedContent = {
  articleId: string;
  slug: string;
  url: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  paragraphs: string[];
  internalLinks: string[];
  fullArticle: string;
  [key: string]: string | string[];
};

type AppContextType = {
  prompts: string[];
  setPrompts: React.Dispatch<React.SetStateAction<string[]>>;
  metaPrompts: MetaPrompts;
  setMetaPrompts: React.Dispatch<React.SetStateAction<MetaPrompts>>;
  csvData: CSVData | null;
  setCsvData: React.Dispatch<React.SetStateAction<CSVData | null>>;
  csvFile: File | null;
  setCsvFile: React.Dispatch<React.SetStateAction<File | null>>;
  apiSettings: APISettingsType;
  setApiSettings: React.Dispatch<React.SetStateAction<APISettingsType>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  generatedContent: GeneratedContent[];
  setGeneratedContent: React.Dispatch<React.SetStateAction<GeneratedContent[]>>;
  downloadUrl: string | null;
  setDownloadUrl: React.Dispatch<React.SetStateAction<string | null>>;
  progressCurrent: number;
  progressTotal: number;
  setProgressCurrent: React.Dispatch<React.SetStateAction<number>>;
  setProgressTotal: React.Dispatch<React.SetStateAction<number>>;
  apiLogs: APILog[];
  clearLogs: () => void;
  addPrompt: () => void;
  removePrompt: (index: number) => void;
  updatePrompt: (index: number, value: string) => void;
  generateArticles: () => Promise<void>;
  pauseGeneration: () => void;
  resumeGeneration: () => void;
  templates: Template[];
  currentTemplate: Template | null;
  setCurrentTemplate: (template: Template | null) => void;
  loadTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;
  deleteTemplate: (name: string) => void;
  updateTemplate: (template: Template) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const savedTemplates = localStorage.getItem("templates");
    return savedTemplates ? JSON.parse(savedTemplates) : [defaultTemplate];
  });

  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(
    () => {
      return templates[0] || null;
    }
  );

  const [prompts, setPrompts] = useState<string[]>(() => {
    return currentTemplate?.prompts ?? [];
  });

  const [metaPrompts, setMetaPrompts] = useState<MetaPrompts>(() => {
    return (
      currentTemplate?.metaPrompts || {
        h1: "",
        metaTitle: "",
        metaDescription: "",
      }
    );
  });

  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [apiSettings, setApiSettings] = useState<APISettingsType>({
    apiKey: "",
    model: "gpt-4o-mini",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<APILog[]>([]);

  const callOpenAI = async (prompt: string): Promise<string> => {
    console.log("Calling OpenAI with prompt:", prompt);
    const startTime = Date.now();
    const logId = `log-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiQueue.add(async () => {
          if (isQueuePaused()) {
            await new Promise<void>((resolve) => {
              const checkPause = () => {
                if (!isQueuePaused()) resolve();
                else setTimeout(checkPause, 100);
              };
              checkPause();
            });
          }

          const res = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiSettings.apiKey}`,
              },
              body: JSON.stringify({
                model: apiSettings.model,
                messages: [
                  {
                    role: "system",
                    content:
                      "You are an expert plumber with deep knowledge of plumbing systems and emergency interventions. Write in a professional but approachable tone, focusing on technical expertise and customer service. When formatting text, use HTML sparingly and avoid excessive bold tags (<b>). Only use bold for truly important terms or key phrases that need emphasis. Never wrap entire paragraphs or sentences in bold tags.",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.7,
                max_tokens: 1000,
              }),
            }
          );

          if (!res.ok) {
            const errorData = await res
              .json()
              .catch(() => ({ error: { message: res.statusText } }));
            throw new Error(
              `OpenAI API error: ${errorData.error?.message || res.statusText}`
            );
          }

          return res.json();
        });

        const content = response.choices[0].message.content;
        console.log("OpenAI response:", content);

        setApiLogs((prev) => [
          ...prev,
          {
            id: logId,
            timestamp: new Date().toISOString(),
            prompt,
            response: content,
            duration: Date.now() - startTime,
          },
        ]);

        return content;
      } catch (error) {
        console.error("OpenAI API error:", error);
        if (attempt === maxRetries) {
          setApiLogs((prev) => [
            ...prev,
            {
              id: logId,
              timestamp: new Date().toISOString(),
              prompt,
              response: "",
              error: error instanceof Error ? error.message : "Unknown error",
              duration: Date.now() - startTime,
            },
          ]);
          throw error;
        }

        await sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error("Maximum retries exceeded");
  };

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (currentTemplate) {
      setPrompts(currentTemplate.prompts ?? []);
      setMetaPrompts(currentTemplate.metaPrompts);
    }
  }, [currentTemplate]);

  const clearLogs = () => {
    setApiLogs([]);
  };

  const addPrompt = () => {
    setPrompts((prev) => [...prev, ""]);
  };

  const removePrompt = (index: number) => {
    const newPrompts = [...prompts];
    newPrompts.splice(index, 1);
    setPrompts(newPrompts);
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const processPrompt = (prompt: string, variables: Record<string, string>) => {
    let processedPrompt = prompt;
    for (const [key, value] of Object.entries(variables)) {
      processedPrompt = processedPrompt.replace(
        new RegExp(`{{${key}}}`, "g"),
        value
      );
    }
    return processedPrompt;
  };

  const pauseGeneration = () => {
    setIsPaused(true);
    setQueuePaused(true);
  };

  const resumeGeneration = () => {
    setIsPaused(false);
    setQueuePaused(false);
  };

  const loadTemplate = (template: Template) => {
    console.log("Loading template:", template);
    setTemplates((prev) => [...prev, template]);
    setCurrentTemplate(template);
  };

  const saveTemplate = (template: Template) => {
    console.log("Saving template:", template);
    setTemplates((prev) => [...prev, template]);
    setCurrentTemplate(template);
  };

  const deleteTemplate = (name: string) => {
    setTemplates((prev) => prev.filter((t) => t.name !== name));
    if (currentTemplate?.name === name) {
      setCurrentTemplate(templates[0] || null);
    }
  };

  const updateTemplate = (updatedTemplate: Template) => {
    console.log("Updating template:", updatedTemplate);

    const templateToUpdate = {
      ...updatedTemplate,
      prompts: currentTemplate?.prompts || [],
      metaPrompts: currentTemplate?.metaPrompts || {
        h1: "",
        metaTitle: "",
        metaDescription: "",
      },
    };

    setTemplates((prev) => {
      const newTemplates = prev.map((t) =>
        t.name === templateToUpdate.name ? templateToUpdate : t
      );
      localStorage.setItem("templates", JSON.stringify(newTemplates));
      return newTemplates;
    });

    setCurrentTemplate(templateToUpdate);
  };

  const applyTemplate = (
    variables: Record<string, string>,
    template: Template
  ): string => {
    console.log("Applying template with variables:", variables);
    if (!template?.template?.content) {
      console.error("Invalid template structure:", template);
      return "";
    }

    let content = template.template.content;

    content = cleanHtml(content);

    Object.entries(variables).forEach(([key, value]) => {
      const cleanedValue = cleanText(value || "");
      content = content
        .replace(new RegExp(`{{${key}}}`, "g"), cleanedValue)
        .replace(new RegExp(`{${key}}`, "g"), cleanedValue);
    });

    const result = compactParagraphs(content);
    console.log("Template result:", result);
    return result;
  };

  const generateArticles = async () => {
    if (!csvData || !apiSettings.apiKey || !currentTemplate) {
      console.error("Missing required data");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent([]);
    setDownloadUrl(null);
    setIsPaused(false);
    setQueuePaused(false);
    setProgressCurrent(0);
    setProgressTotal(csvData.rows.length);

    try {
      const results: GeneratedContent[] = [];

      const batchSize = 5;
      for (let i = 0; i < csvData.rows.length; i += batchSize) {
        const batch = csvData.rows.slice(i, i + batchSize);
        const batchPromises = batch.map(async (row, batchIndex) => {
          const articleIndex = i + batchIndex;
          console.log(`\n📝 Article ${articleIndex + 1} - ${row.Comune}`);

          try {
            // Generate paragraphs
            const paragraphs = await Promise.all(
              prompts.map(async (prompt) => {
                if (!prompt.trim()) return "";
                const processedPrompt = processPrompt(prompt, row);
                return callOpenAI(processedPrompt).then(cleanText);
              })
            );

            // Generate meta content only if prompts exist
            let h1 = row.h1 || ""; // Use CSV data or empty
            let metaTitle = row.metaTitle || ""; // Use CSV data or empty
            let metaDescription = row.metaDescription || ""; // Use CSV data or empty

            // Generate H1 if prompt exists and no CSV data
            if (!h1 && metaPrompts.h1.trim()) {
              const processedPrompt = processPrompt(metaPrompts.h1, row);
              h1 = await callOpenAI(processedPrompt).then(cleanText);
            }

            // Generate meta title if prompt exists and no CSV data
            if (!metaTitle && metaPrompts.metaTitle.trim()) {
              const processedPrompt = processPrompt(metaPrompts.metaTitle, row);
              metaTitle = await callOpenAI(processedPrompt).then(cleanText);
            }

            // Generate meta description if prompt exists and no CSV data
            if (!metaDescription && metaPrompts.metaDescription.trim()) {
              const processedPrompt = processPrompt(
                metaPrompts.metaDescription,
                row
              );
              metaDescription = await callOpenAI(processedPrompt).then(
                cleanText
              );
            }

            console.log("Generated content:", {
              h1,
              metaTitle,
              metaDescription,
              paragraphs,
            });

            const internalLinksHtml = currentTemplate.template?.internalLinks
              ?.enabled
              ? generateInternalLinks(
                  row,
                  csvData.rows,
                  currentTemplate.template.internalLinks
                )
              : "";

            const templateVariables = {
              h1: h1 || row.Comune || "Default Title", // Use generated/CSV or fallback for template
              Comune: row.Comune || "",
              ...paragraphs.reduce(
                (acc, content, idx) => ({
                  ...acc,
                  [`paragraph_${idx + 1}`]: content,
                }),
                {}
              ),
              internal_links: internalLinksHtml,
            };

            console.log("Template variables:", templateVariables);

            const fullArticle = applyTemplate(
              templateVariables,
              currentTemplate
            );

            const result = {
              articleId: `art-${Date.now()}-${Math.floor(
                Math.random() * 1000
              )}`,
              slug:
                row.slug ||
                `idraulico-${row.Comune?.toLowerCase().replace(/\s+/g, "-")}`,
              url:
                row.url ||
                `/${row.Provincia?.toLowerCase()}/${
                  row.slug ||
                  `idraulico-${row.Comune?.toLowerCase().replace(/\s+/g, "-")}`
                }`,
              h1: h1 || row.h1 || "", // Only use generated or CSV data, no fallback
              metaTitle: metaTitle,
              metaDescription: metaDescription,
              paragraphs,
              internalLinks: [],
              fullArticle,
              ...row,
            };

            console.log("Generated article:", result);
            return result;
          } catch (error) {
            console.error(
              `Error generating article ${articleIndex + 1}:`,
              error
            );
            throw error;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        setGeneratedContent((prev) => [...prev, ...batchResults]);

        // Update progress counter
        setProgressCurrent(results.length);
      }

      const csvContent = generateResultCSV(results);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error generating articles:", error);
      alert(
        "Error generating articles. Please check your API key and try again."
      );
    } finally {
      setIsGenerating(false);
      setIsPaused(false);
      setQueuePaused(false);
      setProgressCurrent(0);
      setProgressTotal(0);
    }
  };

  const generateResultCSV = (results: GeneratedContent[]): string => {
    if (results.length === 0) return "";

    // Determine which columns have content across all results
    const hasContent = {
      h1: results.some(
        (result) =>
          result.h1 && result.h1.trim() && !result.h1.includes("Default Title")
      ),
      metaTitle: results.some(
        (result) => result.metaTitle && result.metaTitle.trim()
      ),
      metaDescription: results.some(
        (result) => result.metaDescription && result.metaDescription.trim()
      ),
    };

    // Build headers dynamically based on content
    const headers = ["article_number"];

    if (hasContent.h1) headers.push("h1");
    if (hasContent.metaTitle) headers.push("metaTitle");
    if (hasContent.metaDescription) headers.push("metaDescription");

    // Add paragraph columns that have content
    for (let i = 1; i <= 10; i++) {
      const hasThisParagraph = results.some(
        (result) =>
          result.paragraphs?.[i - 1] && result.paragraphs[i - 1].trim()
      );
      if (hasThisParagraph) {
        headers.push(`paragraph_${i}`);
      }
    }

    headers.push("slug", "Padre", "template");

    let csv = headers.join(",") + "\n";

    results.forEach((result, index) => {
      const row = headers.map((column) => {
        let value = "";

        switch (column) {
          case "article_number":
            value = String(index + 1);
            break;
          case "template":
            value = result.fullArticle || "";
            break;
          case "slug":
            value = result.slug || "";
            break;
          case "Padre":
            value = typeof result.Padre === "string" ? result.Padre : "";
            break;
          case "h1":
            value =
              result.h1 && !result.h1.includes("Default Title")
                ? result.h1
                : "";
            break;
          case "metaTitle":
            value = result.metaTitle || "";
            break;
          case "metaDescription":
            value = result.metaDescription || "";
            break;
          default:
            if (column.startsWith("paragraph_")) {
              const paragraphNum = parseInt(column.split("_")[1]) - 1;
              value = result.paragraphs?.[paragraphNum] || "";
            } else {
              const resultValue = result[column];
              value = typeof resultValue === "string" ? resultValue : "";
            }
        }

        return `"${value.replace(/"/g, '""')}"`;
      });

      csv += row.join(",") + "\n";
    });

    return csv;
  };

  const value = {
    prompts,
    setPrompts,
    metaPrompts,
    setMetaPrompts,
    csvData,
    setCsvData,
    csvFile,
    setCsvFile,
    apiSettings,
    setApiSettings,
    isGenerating,
    setIsGenerating,
    isPaused,
    setIsPaused,
    progressCurrent,
    progressTotal,
    setProgressCurrent,
    setProgressTotal,
    generatedContent,
    setGeneratedContent,
    downloadUrl,
    setDownloadUrl,
    apiLogs,
    clearLogs,
    addPrompt,
    removePrompt,
    updatePrompt,
    generateArticles,
    pauseGeneration,
    resumeGeneration,
    templates,
    currentTemplate,
    setCurrentTemplate,
    loadTemplate,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
