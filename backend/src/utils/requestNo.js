function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

async function generateRequestNo(knex) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const prefix = `MR-${yyyy}${mm}${dd}`;
  const likePrefix = `${prefix}-%`;
  const [{ count }] = await knex('requests')
    .where('request_no', 'like', likePrefix)
    .count({ count: '*' });
  const seq = pad(Number(count) + 1, 4);
  return `${prefix}-${seq}`;
}

module.exports = { generateRequestNo };
