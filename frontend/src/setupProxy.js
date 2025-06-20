const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for Pickrr API
  app.use(
    '/pickrr',
    createProxyMiddleware({
      target: 'https://pickout.pickrr.com',
      changeOrigin: true,
      pathRewrite: {
        '^/pickrr': '', // Remove /pickrr prefix when forwarding
      },
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
    })
  );

  // Proxy for ngrok endpoint
  app.use(
    '/generate-ad-copy',
    createProxyMiddleware({
      target: 'https://ef45-3-111-202-221.ngrok-free.app',
      changeOrigin: true,
      secure: false,
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
    })
  );
}; 