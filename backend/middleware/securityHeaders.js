const setSecurityHeaders = (req, res, next) => {
  const connectSrc = [
    "'self'",
    "https://api.iplcmiami.com",
    "wss://booksmartly.iplcmiami.com",
    "https://www.google-analytics.com",
    "https://maps.googleapis.com",
    "https://*.squarecdn.com",
    "https://connect.squareup.com",
    "https://connect.squareupsandbox.com",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
    "https://www.googleapis.com",
    "https://api.twilio.com",
    "https://verify.twilio.com",
  ];

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://accounts.google.com",
    "https://apis.google.com",
    "https://js.squareup.com",
    "https://sandbox.web.squarecdn.com",
    "https://web.squarecdn.com",
  ];

  const frameSrc = [
    "'self'",
    "https://accounts.google.com",
    "https://js.squareup.com",
    "https://sandbox.web.squarecdn.com",
    "https://web.squarecdn.com",
  ];

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: https://static.vecteezy.com",
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

module.exports = setSecurityHeaders;