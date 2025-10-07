import { api } from './setup';

describe('Auth', () => {
  it('should reject missing creds', async () => {
    const res = await api.post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
