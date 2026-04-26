import { createLead, getLeads, getLeadsStats } from '../_lib/firestore-service.js';
import { requireAdmin, handleCors } from '../_lib/auth-middleware.js';

// Simple in-memory rate limiter for lead creation (per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // max 5 leads per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up stale entries periodically (every 100 checks)
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
    }
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

// Validation function for lead input
function validateLeadInput(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Request body must be a valid object');
  }

  // Check required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new Error('Name is required and must be a non-empty string');
  }

  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    throw new Error('Phone is required and must be a non-empty string');
  }

  if (data.email && typeof data.email !== 'string') {
    throw new Error('Email must be a string');
  }

  // Enforce reasonable length limits
  if (data.name.length > 100) {
    throw new Error('Name must not exceed 100 characters');
  }

  if (data.phone.length > 20) {
    throw new Error('Phone must not exceed 20 characters');
  }

  if (data.email && data.email.length > 100) {
    throw new Error('Email must not exceed 100 characters');
  }

  // Check payload size (rough check)
  if (JSON.stringify(data).length > 10000) {
    throw new Error('Request payload is too large');
  }

  return {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email ? data.email.trim() : undefined,
    message: data.message ? String(data.message).trim() : undefined,
    quizAnswers: data.quizAnswers || {},
    source: data.source || undefined,
    category: data.category || undefined
  };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      // Rate limit lead creation by IP
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || 'unknown';

      if (isRateLimited(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.'
        });
      }

      // Validate input before creating lead
      let validatedData;
      try {
        validatedData = validateLeadInput(req.body);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError.message
        });
      }

      const result = await createLead(validatedData);
      return res.status(201).json(result);
    }

    if (req.method === 'GET') {
      // 1. Verify Admin
      const adminUser = await requireAdmin(req, res);
      if (!adminUser) return; // Response sent by middleware

      // 2. Fetch Data (leads + stats in parallel; stats are cached server-side for 2 min)
      const limit = parseInt(req.query.limit) || 10;
      const queryWithExtra = { ...req.query, limit: limit + 1 };

      const [leads, stats] = await Promise.all([
        getLeads(queryWithExtra),
        getLeadsStats()  // Uses cached result if fresh (saves 5-6 reads)
      ]);

      // Determine if there are more items and set cursor appropriately
      let nextCursor = null;
      let finalLeads = leads;
      
      if (leads.length > limit) {
        nextCursor = leads[limit].id;
        finalLeads = leads.slice(0, limit);
      }

      return res.status(200).json({
        success: true,
        leads: finalLeads,
        stats,
        count: finalLeads.length,
        nextCursor
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
