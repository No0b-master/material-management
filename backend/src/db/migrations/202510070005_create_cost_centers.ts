import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cost_centers', (table) => {
    table.increments('id').primary();
    table.string('n3_code', 50).notNullable();
    table.string('description', 255).notNullable();
    table.string('cost_center', 50).notNullable();
    table.string('hod_name', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cost_centers');
}
