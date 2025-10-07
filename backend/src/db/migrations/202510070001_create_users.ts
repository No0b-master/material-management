import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('contact_no', 50);
    table.string('employee_code', 50);
    table.enu('role', ['requester', 'hod', 'pm', 'store', 'admin']).notNullable().defaultTo('requester');
    table.string('department', 100);
    table.string('cost_center', 50);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
