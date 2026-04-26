import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import http from 'http';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - manually parse to guarantee process.env is set
const envPath = path.resolve(__dirname, '.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
  console.log('✅ Env loaded from', envPath);
  console.log('🔧 FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? 'SET' : 'MISSING');
  console.log('🔧 FIREBASE_ADMIN_PRIVATE_KEY:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET' : 'MISSING');
  console.log('🔧 FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'SET' : 'MISSING');
} catch (err) {
  console.error('❌ Failed to load .env.local:', err.message);
}

// Global Error Handlers
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
});

const app = express();
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/@vite') && !req.url.startsWith('/src') && !req.url.includes('.')) {
    console.log(`🕒 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!', timestamp: new Date().toISOString() });
});

// Import API handlers with cache busting
const loadHandler = async (handlerPath) => {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const module = await import(handlerPath + cacheBuster);
    return module.default;
  } catch (err) {
    console.error(`❌ Failed to load handler ${handlerPath}:`, err);
    throw err;
  }
};

// API Routes
// Razorpay (dynamic [action] handler)
app.all('/api/razorpay/:action', async (req, res) => {
  try {
    req.query.action = req.params.action;
    const handler = await loadHandler('./api/razorpay/[action].js');
    await handler(req, res);
  } catch (error) {
    console.error(`❌ /api/razorpay/${req.params.action} error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route all /api/lead requests (POST, GET) through the Vercel handler
// This ensures validation, auth, and full filter support work locally
app.all('/api/lead', async (req, res) => {
  try {
    const handler = await loadHandler('./api/lead/index.js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/lead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route PATCH, DELETE, GET for /api/lead/:id through the handler
app.all('/api/lead/:id', async (req, res) => {
  try {
    req.query = { ...req.query, id: req.params.id };
    const handler = await loadHandler('./api/lead/[id].js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Product API routes
app.all('/api/products/bulk', async (req, res) => {
  try {
    const handler = await loadHandler('./api/products/bulk.js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/products/bulk error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.all('/api/products/upload-image', async (req, res) => {
  try {
    const handler = await loadHandler('./api/products/upload-image.js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/products/upload-image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.all('/api/products/import-excel', async (req, res) => {
  try {
    const handler = await loadHandler('./api/products/import-excel.js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/products/import-excel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.all('/api/products/:id', async (req, res) => {
  try {
    req.query = { ...req.query, id: req.params.id };
    const handler = await loadHandler('./api/products/[id].js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/products/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.all('/api/products', async (req, res) => {
  try {
    const handler = await loadHandler('./api/products/index.js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Category API routes (catch-all [[...path]] handler)
app.all('/api/categories/:slug', async (req, res) => {
  try {
    req.query.path = [req.params.slug];
    const handler = await loadHandler('./api/categories/[[...path]].js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/categories/:slug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.all('/api/categories', async (req, res) => {
  try {
    req.query.path = [];
    const handler = await loadHandler('./api/categories/[[...path]].js');
    await handler(req, res);
  } catch (error) {
    console.error('❌ /api/categories error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics API routes (dynamic [slug] handler)
app.all('/api/analytics/:slug', async (req, res) => {
  try {
    req.query.slug = req.params.slug;
    const handler = await loadHandler('./api/analytics/[slug].js');
    await handler(req, res);
  } catch (error) {
    console.error(`❌ /api/analytics/${req.params.slug} error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/verify', async (req, res) => {
  try {
    const handler = await loadHandler('./api/admin/verify.js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = 5175;
const HOST = '0.0.0.0'; // Listen on all interfaces

async function startServer() {
  console.log('🚀 Starting Development Server...');

  const vite = await createViteServer({
    server: {
      middlewareMode: true
    },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    // Skip API, Vite internal files, and files with extensions
    if (url.startsWith('/api') || url.startsWith('/@') || url.includes('.')) {
      return next();
    }

    try {
      console.log(`🌐 Rendering SPA Page: ${url}`);
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('❌ Rendering Error:', e);
      res.status(500).end(e.stack);
    }
  });

  const server = http.createServer(app);

  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/@vite/client' || req.headers['sec-websocket-protocol'] === 'vite-hmr') {
      vite.ws.handleUpgrade(req, socket, head, (ws) => {
        vite.ws.emit('connection', ws, req);
      });
    }
  });

  server.listen(PORT, HOST, () => {
    // Find the LAN IP address
    const nets = os.networkInterfaces();
    let lanIP = '127.0.0.1';
    for (const iface of Object.values(nets)) {
      for (const cfg of iface) {
        if (cfg.family === 'IPv4' && !cfg.internal) {
          lanIP = cfg.address;
          break;
        }
      }
      if (lanIP !== '127.0.0.1') break;
    }

    console.log(`\n  ✅ SERVER READY`);
    console.log(`  🔗 Local:   http://localhost:${PORT}`);
    console.log(`  🔗 Network: http://${lanIP}:${PORT}  ← open this on your phone`);
    console.log(`  🔗 Admin:   http://localhost:${PORT}/admin\n`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Try running: npx kill-port ${PORT}`);
      process.exit(1);
    } else {
      console.error('❌ Server Listen Error:', e);
    }
  });
}

startServer().catch((err) => {
  console.error('❌ FAILED TO START SERVER:', err);
  process.exit(1);
});
