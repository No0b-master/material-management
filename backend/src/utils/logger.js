const morgan = require('morgan');

const httpLogger = morgan('combined');

function audit(knex, requestId, action, performedBy) {
  return knex('audit_logs').insert({ request_id: requestId, action, performed_by: performedBy, timestamp: knex.fn.now() });
}

module.exports = { httpLogger, audit };
