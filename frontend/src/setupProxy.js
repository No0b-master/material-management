const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = 'http://localhost:4000';
  const paths = ['/auth','/users','/requests','/approvals','/dashboard','/reports','/cost-centers','/meta'];
  paths.forEach(p => app.use(p, createProxyMiddleware({ target, changeOrigin: true })));
};
