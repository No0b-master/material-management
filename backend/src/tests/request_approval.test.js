const request = require('supertest');
const appFactory = require('../testApp');
const knex = require('../config/db');
const bcrypt = require('bcryptjs');

let app;

async function login(username, password) {
  const res = await request(app).post('/auth/login').send({ username, password });
  if (res.status !== 200) throw new Error('login failed for ' + username);
  return res.body.accessToken;
}

beforeAll(async () => {
  app = await appFactory();
  // Insert a requester user
  const password = bcrypt.hashSync('Password@123', 10);
  await knex('users').insert({ username: 'req1', password, name: 'Requester One', email: 'req1@example.com', role: 'requester', department: 'R&D' });
});

describe('Request and Approvals flow', () => {
  test('request create and three-level approval', async () => {
    const requesterToken = await login('req1', 'Password@123');
    const payload = {
      dept: 'R&D',
      cost_center: '24307',
      hod_name: 'Deepak Malhotra',
      n3_code: '13',
      username: 'Requester One',
      contact_no: '1234567890',
      employee_code: 'E001',
      email: 'req1@example.com',
      pmo_name: 'Manish Chhabra',
      part_code: 'P-100',
      description: 'Test Part',
      quantity: 2,
      type: 'UPL',
      project_name: 'ProjX',
      purpose: 'Testing',
      plant_name: 'PI-1',
      plant_on_hand_qty: 0
    };
    const createRes = await request(app).post('/requests').set('Authorization', `Bearer ${requesterToken}`).send(payload);
    expect(createRes.status).toBe(201);
    const reqId = createRes.body.id;

    // HOD approve
    const hod = await knex('users').where({ role: 'hod', name: 'Deepak Malhotra' }).first();
    const hodToken = await login(hod.username, 'Password@123');
    const a1 = await request(app).post(`/approvals/${reqId}`).set('Authorization', `Bearer ${hodToken}`).send({ action: 'Approve' });
    expect(a1.status).toBe(200);

    // PM approve
    const pmToken = await login('pm1', 'Password@123');
    const a2 = await request(app).post(`/approvals/${reqId}`).set('Authorization', `Bearer ${pmToken}`).send({ action: 'Approve' });
    expect(a2.status).toBe(200);

    // Store approve
    const storeToken = await login('store1', 'Password@123');
    const a3 = await request(app).post(`/approvals/${reqId}`).set('Authorization', `Bearer ${storeToken}`).send({ action: 'Approve' });
    expect(a3.status).toBe(200);

    const finalReq = await knex('requests').where({ id: reqId }).first();
    expect(finalReq.status).toBe('Approved');

    const history = await request(app).get(`/approvals/${reqId}`).set('Authorization', `Bearer ${storeToken}`);
    expect(history.status).toBe(200);
    expect(history.body.length).toBe(3);
  }, 20000);
});

afterAll(async () => {
  await knex.destroy();
});
