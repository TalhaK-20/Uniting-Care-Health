const path = require('path');
const favicon = require('serve-favicon');

const faviconMiddleware = favicon(path.join(__dirname, '../public/images', 'favicon.jpeg'));

module.exports = faviconMiddleware;