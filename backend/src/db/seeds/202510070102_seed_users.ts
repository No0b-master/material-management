import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

const pmTeam = [
  'Manish Chhabra','Gulshan Kumar','Prince Singh','Pankaj Modi','Vaibhav Jindal','Akshay Singh','Shivam Singh','Varun Sarkar','Gaurav Tiwari','Saurabh Sharma','Ankit Gupta','Pradeep Yadav','Prashant Dubey','Sameer Malik'
];

const storeTeam = ['Jai Prakash Jaul'];

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const users: any[] = [];

  for (const name of pmTeam) {
    const username = name.toLowerCase().replace(/\s+/g, '.');
    users.push({
      username,
      password: passwordHash,
      name,
      email: `${username}@example.com`,
      role: 'pm',
    });
  }

  for (const name of storeTeam) {
    const username = name.toLowerCase().replace(/\s+/g, '.');
    users.push({
      username,
      password: passwordHash,
      name,
      email: `${username}@example.com`,
      role: 'store',
    });
  }

  // HOD users from cost_centers distinct hod_name
  const hodNamesRows = await knex('cost_centers').distinct('hod_name as name');
  for (const row of hodNamesRows) {
    const name: string = row.name;
    const username = name.toLowerCase().replace(/\s+/g, '.');
    users.push({
      username,
      password: passwordHash,
      name,
      email: `${username}@example.com`,
      role: 'hod',
    });
  }

  // Example admin
  users.push({
    username: 'admin',
    password: passwordHash,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  });

  await knex('users').insert(users);
}
