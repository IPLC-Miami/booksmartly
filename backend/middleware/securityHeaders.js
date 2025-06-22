const setSecurityHeaders = (req, res, next) => {
  const connectSrc = ["'self'", "https://api.iplcmiami.com", "wss://booksmartly.iplcmiami.com", "https://www.google-analytics.com"];
  connectSrc.push("https://maps.googleapis.com", "https://*.squarecdn.com", "wss://booksmartly.iplcmiami.com");

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https: https://static.vecteezy.com; " +
    `connect-src ${connectSrc.join(' ')}; ` +
    "frame-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  next();
};

module.exports = setSecurityHeaders;