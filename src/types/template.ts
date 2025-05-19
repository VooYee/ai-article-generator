export interface Template {
  name: string;
  version: string;
  template: {
    content?: string;
    sections?: TemplateSection[];
    variables: Record<string, string>;
    mapping?: Record<string, string>;
    internalLinks?: {
      enabled: boolean;
      maxLinks: number;
      linkFormat: string;
      titleFormat: string;
      groupBy: string;
      filterBy?: string[];
    };
  };
}

export interface TemplateSection {
  type: string;
  content: string;
  children?: TemplateSection[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'html' | 'list' | 'date';
  description?: string;
  defaultValue?: string;
  required?: boolean;
  csvColumn?: string;
}