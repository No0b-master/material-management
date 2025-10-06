const request = require('supertest');
const appFactory = require('../testApp');
const knex = require('../config/db');

let app;

beforeAll(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
  app = await appFactory();
});

describe('Auth', () => {
  test('login fails with wrong credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'nope', password: 'nope' });
    expect(res.status).toBe(401);
  });
});

afterAll(async () => {
  await knex.destroy();
});
