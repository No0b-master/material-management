const bcrypt = require('bcryptjs');

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex('users').del();
  const defaultPassword = bcrypt.hashSync('Password@123', 10);

  const admin = { username: 'admin', password: defaultPassword, name: 'Admin', email: 'admin@example.com', role: 'admin', department: 'IT' };

  const pmNames = [
    'Manish Chhabra','Gulshan Kumar','Prince Singh','Pankaj Modi','Vaibhav Jindal','Akshay Singh','Shivam Singh','Varun Sarkar','Gaurav Tiwari','Saurabh Sharma','Ankit Gupta','Pradeep Yadav','Prashant Dubey','Sameer Malik'
  ];
  const pmUsers = pmNames.map((name, i) => ({
    username: `pm${i+1}`,
    password: defaultPassword,
    name,
    email: `${name.toLowerCase().replace(/\s+/g,'_')}@example.com`,
    role: 'pm',
    department: 'PMO'
  }));

  const storeUsers = [
    { username: 'store1', password: defaultPassword, name: 'Jai Prakash Jaul', email: 'jai_prakash_jaul@example.com', role: 'store', department: 'Store' }
  ];

  // Seed some HODs based on cost_centers hod_name distinct
  const costCenters = await knex('cost_centers').select('hod_name').groupBy('hod_name');
  const hodUsers = costCenters.map((c, i) => ({
    username: `hod${i+1}`,
    password: defaultPassword,
    name: c.hod_name,
    email: `${c.hod_name.toLowerCase().replace(/\s+/g,'_')}@example.com`,
    role: 'hod',
    department: 'R&D'
  }));

  await knex('users').insert([admin, ...pmUsers, ...storeUsers, ...hodUsers]);
};
