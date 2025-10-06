const dayjs = require('dayjs');

async function generateRequestNo(knex) {
  const todayPrefix = dayjs().format('YYYYMMDD');
  const prefix = `MR-${todayPrefix}-`;
  const [{ count }] = await knex('requests')
    .where('request_no', 'like', `${prefix}%`)
    .count({ count: '*' });
  const seq = String(Number(count) + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

module.exports = { generateRequestNo };
