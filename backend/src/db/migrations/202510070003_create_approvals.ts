import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('approvals', (table) => {
    table.increments('id').primary();
    table
      .integer('request_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('requests')
      .onDelete('CASCADE');
    table
      .integer('approver_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.specificType('level', 'TINYINT').notNullable();
    table.enu('action', ['Approve', 'Reject', 'Send Back']).notNullable();
    table.text('comments');
    table.dateTime('timestamp').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('approvals');
}
