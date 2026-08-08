import sanitizeHtml from 'sanitize-html';

/**
 * Middleware to sanitize all incoming request data (body, query, params)
 * It recursively strips HTML tags from strings to prevent XSS.
 */
const cleanObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [], // Strip all tags
      allowedAttributes: {}, // Strip all attributes
    }).trim();
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = cleanObject(value);
    }
    return sanitizedObj;
  }
  return obj;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};