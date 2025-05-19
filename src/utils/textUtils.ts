import { decode } from 'html-entities';

// Simplified patterns for basic text cleaning
const PATTERNS = {
  codeBlocks: /^(```html|'''html|```|''')\s*|\s*(```|''')$/gi,
  htmlPrefix: /^html\s*/i,
  sectionTags: /<\/?section>/g,
  bTags: {
    empty: /<b>(\s*)<\/b>/g,
    nested: /<b>\s*<b>|<\/b>\s*<\/b>/g,
    shortcodes: /<b>(\[[^\]]+\])<\/b>/g,
  },
  newlines: /\n+/g,
  explanations: /^\s*[\"\'#`]|questa riformulazione/i,
  quotes: /"{2,}/g,
  spacing: /\s+/g
};

// Keywords that shouldn't be wrapped in <b> tags
const KEYWORDS = [
  'idraulico urgente',
  'idraulico economico',
  'idraulico notturno',
  'spurgo lavandini',
  'sblocco WC',
  'emergenza tubazioni',
  'idraulico per condomini',
  'assistenza scaldabagno urgente',
  'riparazione termosifoni'
].map(kw => new RegExp(`<b>(${kw}[\\w\\sàèéìòù-]*)<\/b>`, 'gi'));

export const cleanText = (text: string): string => {
  let cleaned = decode(text.trim());

  // Basic cleanup
  cleaned = cleaned
    .replace(PATTERNS.codeBlocks, '')
    .replace(PATTERNS.htmlPrefix, '')
    .replace(PATTERNS.sectionTags, '');

  // Remove empty and nested bold tags
  cleaned = cleaned
    .replace(PATTERNS.bTags.empty, '')
    .replace(PATTERNS.bTags.nested, '<b>')
    .replace(PATTERNS.bTags.shortcodes, '$1');

  // Remove keywords from b tags
  KEYWORDS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '$1');
  });

  // Final cleanup
  cleaned = cleaned
    .replace(/\ba ([aeiouAEIOU])/g, 'ad $1')
    .split('\n')
    .filter(line => !PATTERNS.explanations.test(line.trim()))
    .join('\n')
    .replace(PATTERNS.quotes, '"')
    .replace(PATTERNS.spacing, ' ')
    .trim();

  return cleaned;
};

export const cleanHtml = (html: string): string => {
  let cleaned = decode(html.trim());

  // Basic cleanup
  cleaned = cleaned
    .replace(PATTERNS.bTags.empty, '')
    .replace(PATTERNS.bTags.nested, '<b>')
    .replace(PATTERNS.bTags.shortcodes, '$1');

  // Remove keywords from b tags
  KEYWORDS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '$1');
  });

  return cleaned;
};

export const compactParagraphs = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  ['p', 'li', 'h2', 'h3', 'blockquote'].forEach(tag => {
    doc.querySelectorAll(tag).forEach(element => {
      const content = Array.from(element.childNodes)
        .map(node =>
          node.nodeType === Node.TEXT_NODE
            ? node.textContent?.trim()
            : (node as Element).outerHTML
        )
        .filter(Boolean)
        .join(' ')
        .replace(PATTERNS.spacing, ' ');

      if (content) {
        element.innerHTML = content;
      } else {
        element.remove();
      }
    });
  });

  return doc.body.innerHTML;
};