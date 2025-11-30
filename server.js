const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 5000;
const EXPO_PORT = 8081;
const BACKEND_PORT = 5001;

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onError: (err, req, res) => {
    console.error('Backend proxy error:', err.message);
    res.status(502).json({ error: 'Backend service unavailable' });
  }
}));

app.use('/', createProxyMiddleware({
  target: `http://localhost:${EXPO_PORT}`,
  changeOrigin: true,
  ws: true,
  onError: (err, req, res) => {
    console.error('Expo proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).send('Expo dev server is starting up...');
    }
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Combined server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying API requests to backend on port ${BACKEND_PORT}`);
  console.log(`Proxying other requests to Expo on port ${EXPO_PORT}`);
});
