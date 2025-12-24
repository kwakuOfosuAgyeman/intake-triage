// src/utils/sanitize.js
import sanitizeHtml from 'sanitize-html';

export const cleanInput = (text) => {
  if (typeof text !== 'string') return text;
  return sanitizeHtml(text, {
    allowedTags: [], 
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });
};

// New helper to clean multiple fields at once
export const sanitizeObject = (obj) => {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = cleanInput(sanitized[key]);
    }
  }
  return sanitized;
};