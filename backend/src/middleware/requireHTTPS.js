/**
 * Middleware to enforce HTTPS in production environments.
 * It checks the 'x-forwarded-proto' header which is typically set by reverse proxies (like Render, Heroku, Nginx).
 */
export const requireHTTPS = (req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
  }
  next();
};