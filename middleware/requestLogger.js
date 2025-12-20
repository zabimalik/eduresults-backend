// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const logBody = { ...req.body };
    // Remove sensitive fields if any
    delete logBody.password;
    console.log('Request Body:', JSON.stringify(logBody, null, 2));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log response for errors or in development
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      console.log('Response:', JSON.stringify(body, null, 2));
    }
    
    return originalJson.call(this, body);
  };

  next();
};