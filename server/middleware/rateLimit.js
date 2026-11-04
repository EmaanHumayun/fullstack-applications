const hitMap = new Map();

/**
 * In-memory sliding window rate limiter.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 minutes)
 * @param {number} options.max - Max attempts per window (default 10)
 * @param {string} options.message - Error message when rate limit exceeded
 */
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 15, message = 'Too many requests. Please try again later.' } = {}) {
  // Periodic cleanup
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hitMap.entries()) {
      if (now - record.startTime > windowMs) {
        hitMap.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    // Skip in test environment if specified
    if (process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT) {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const key = `${req.path}_${String(ip).split(',')[0].trim()}`;
    const now = Date.now();

    let record = hitMap.get(key);
    if (!record) {
      record = { count: 1, startTime: now };
      hitMap.set(key, record);
    } else {
      if (now - record.startTime > windowMs) {
        record.count = 1;
        record.startTime = now;
      } else {
        record.count++;
      }
    }

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({ message, retryAfterSeconds });
    }

    next();
  };
}
