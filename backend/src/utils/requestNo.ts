import dayjs from 'dayjs';
import { Knex } from 'knex';

export async function generateRequestNo(db: Knex): Promise<string> {
  const today = dayjs().format('YYYYMMDD');
  const prefix = `MR-${today}-`;
  // Get max sequence for today
  const rows = await db('requests')
    .where('request_no', 'like', `${prefix}%`)
    .orderBy('request_no', 'desc')
    .limit(1);
  let nextSeq = 1;
  if (rows.length > 0) {
    const lastNo: string = rows[0].request_no;
    const parts = lastNo.split('-');
    const seqStr = parts[2] || '0000';
    const seqNum = parseInt(seqStr, 10) || 0;
    nextSeq = seqNum + 1;
  }
  const padded = String(nextSeq).padStart(4, '0');
  return `${prefix}${padded}`;
}
