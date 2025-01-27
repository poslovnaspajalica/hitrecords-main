import rateLimit from 'express-rate-limit';

// Basic rate limiter
export const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100 // limit svakog IP-a na 100 zahtjeva po windowMs
});

// Strict limiter za webhook endpointe
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 30, // limit svakog IP-a na 30 zahtjeva po minuti
  message: {
    message: 'Too many requests from this IP, please try again after a minute'
  }
});

// Very strict limiter za manual tracking update
export const manualTrackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 5, // limit svakog IP-a na 5 zahtjeva po minuti
  message: {
    message: 'Too many tracking update requests, please try again after a minute'
  }
});

// Rate limiter za bulk akcije
export const bulkActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 2, // limit svakog IP-a na 2 zahtjeva po minuti
  message: {
    message: 'Too many bulk actions, please try again after a minute'
  }
}); 