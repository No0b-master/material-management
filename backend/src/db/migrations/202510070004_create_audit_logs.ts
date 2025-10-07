import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table
      .integer('request_id')
      .unsigned()
      .references('id')
      .inTable('requests')
      .onDelete('CASCADE');
    table.string('action', 255).notNullable();
    table
      .integer('performed_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.dateTime('timestamp').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
