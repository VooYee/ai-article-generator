import { Template, TemplateVariable } from '../types/template';

export const applyTemplate = (template: Template, variables: Record<string, string>, csvRow: Record<string, string>): string => {
  let content = template.template.content || '';
  
  // First replace mapped CSV variables
  if (template.template.mapping) {
    Object.entries(template.template.mapping).forEach(([templateVar, csvColumn]) => {
      const value = csvRow[csvColumn] || '';
      content = content.replace(new RegExp(`{${templateVar}}`, 'g'), value);
    });
  }

  // Then replace any remaining variables
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{${key}}`, 'g'), value || '');
  });

  return cleanHtml(content);
};

export const validateTemplate = (template: any): template is Template => {
  return (
    template &&
    typeof template === 'object' &&
    typeof template.name === 'string' &&
    typeof template.version === 'string' &&
    template.template &&
    (typeof template.template.content === 'string' || Array.isArray(template.template.sections)) &&
    typeof template.template.variables === 'object'
  );
};

export const cleanHtml = (html: string): string => {
  // Remove empty tags
  html = html.replace(/<([^>]+)>\s*<\/\1>/g, '');
  
  // Fix malformed tags
  html = html.replace(/<([^>]+)([^>]*)>/g, (match, tag, attrs) => {
    // Ensure attributes are properly quoted
    attrs = attrs.replace(/(\w+)=([^"'][^\s>]*)/g, '$1="$2"');
    return `<${tag}${attrs}>`;
  });

  // Remove multiple spaces
  html = html.replace(/\s+/g, ' ');

  return html.trim();
};

export const generateInternalLinks = (
  currentRow: Record<string, string>,
  allRows: Record<string, string>[],
  config: Template['template']['internalLinks']
): string => {
  if (!config?.enabled) return '';

  const groupBy = config.groupBy || 'Provincia';
  const maxLinks = config.maxLinks || 5;
  const linkFormat = config.linkFormat || '/{Provincia}/{slug}';
  const titleFormat = config.titleFormat || 'Idraulico {Comune}';
  
  // Count total services in the category
  const totalInCategory = allRows.filter(row => 
    row[groupBy]?.toLowerCase() === currentRow[groupBy]?.toLowerCase()
  ).length;

  // Filter related articles
  const relatedArticles = allRows
    .filter(row => {
      // Don't link to self
      if (row.Comune === currentRow.Comune) return false;
      
      // Group by province or other specified column
      return row[groupBy]?.toLowerCase() === currentRow[groupBy]?.toLowerCase();
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, maxLinks);

  // Generate links using configured format
  const links = relatedArticles.map(article => {
    const url = linkFormat.replace(/{(\w+)}/g, (_, key) => {
      if (key === 'slug') {
        return article.slug || `idraulico-${article.Comune?.toLowerCase().replace(/\s+/g, '-')}`;
      }
      return article[key]?.toLowerCase() || '';
    });
      
    const title = titleFormat
      .replace(/{(\w+)}/g, (_, key) => {
        if (key === 'linkCount') {
          return totalInCategory.toString();
        }
        return article[key] || '';
      });

    return `<li><a href="${url}">${title}</a></li>`;
  });

  if (links.length) {
    return `<ul class="internal-links space-y-2 list-disc pl-5 text-teal-600 hover:text-teal-800">
      ${links.join('\n')}
    </ul>`;
  }

  return '';
};

export const getDefaultTemplate = (): Template => ({
  name: "Default Template",
  version: "1.0",
  template: {
    content: `
<article>
  <h1>{title}</h1>
  {content}
  <footer>
    {related_links}
  </footer>
</article>`,
    variables: {
      title: "",
      content: "",
      related_links: ""
    },
    mapping: {
      title: "title",
      content: "content"
    },
    internalLinks: {
      enabled: true,
      maxLinks: 5,
      linkFormat: "/{category}/{slug}",
      titleFormat: "{type} {city} ({linkCount} servizi)",
      groupBy: "category"
    }
  }
});