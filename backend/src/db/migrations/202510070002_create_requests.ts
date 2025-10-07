import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('requests', (table) => {
    table.increments('id').primary();
    table.string('request_no', 50).notNullable().unique();
    table.dateTime('request_date').notNullable();
    table.string('dept', 100).notNullable();
    table.string('cost_center', 50).notNullable();
    table.string('hod_name', 255).notNullable();
    table.string('n3_code', 50);
    table.string('username', 255).notNullable();
    table.string('contact_no', 50).notNullable();
    table.string('employee_code', 50).notNullable();
    table.string('email', 255).notNullable();
    table.string('pmo_name', 255).notNullable();
    table.string('part_code', 100).notNullable();
    table.text('description').notNullable();
    table.integer('quantity').notNullable();
    table.enu('type', ['UPL', 'CO']).notNullable();
    table.string('project_name', 255);
    table.enu('purpose', ['Testing', 'Build', 'Test', 'Return']).notNullable();
    table.enu('plant_name', ['PI-1', 'PI-2', 'PI-3', 'PI-4', 'SPD']).notNullable();
    table.integer('plant_on_hand_qty');
    table
      .enu('status', ['Pending', 'Sent Back', 'Approved', 'Rejected'])
      .notNullable()
      .defaultTo('Pending');
    table
      .integer('created_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('requests');
}
