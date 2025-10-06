const morgan = require('morgan');

const httpLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

function logError(err, req) {
  const base = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req?.path,
    method: req?.method,
    userId: req?.user?.id
  };
  // eslint-disable-next-line no-console
  console.error('[ERROR]', JSON.stringify(base));
}

module.exports = { httpLogger, logError };
