/** @param { import('knex').Knex } knex */
exports.up = async function(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('username', 100).notNullable().unique();
    t.string('password', 255).notNullable();
    t.string('name', 255);
    t.string('email', 255).unique();
    t.string('contact_no', 50);
    t.string('employee_code', 50);
    t.enum('role', ['requester','hod','pm','store','admin']).notNullable().defaultTo('requester');
    t.string('department', 100);
    t.string('cost_center', 50);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('requests', (t) => {
    t.increments('id').primary();
    t.string('request_no', 50).notNullable().unique();
    t.dateTime('request_date').notNullable();
    t.string('dept', 100);
    t.string('cost_center', 50);
    t.string('hod_name', 255);
    t.string('n3_code', 50);
    t.string('username', 255);
    t.string('contact_no', 50);
    t.string('employee_code', 50);
    t.string('email', 255);
    t.string('pmo_name', 255);
    t.string('part_code', 100);
    t.text('description');
    t.integer('quantity');
    t.enum('type', ['UPL','CO']);
    t.string('project_name', 255);
    t.enum('purpose', ['Testing','Build','Test','Return']);
    t.enum('plant_name', ['PI-1','PI-2','PI-3','PI-4','SPD']);
    t.integer('plant_on_hand_qty');
    t.enum('status', ['Pending','Sent Back','Approved','Rejected','HOD Approved','PM Approved']).notNullable().defaultTo('Pending');
    t.integer('created_by').unsigned().references('users.id');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('approvals', (t) => {
    t.increments('id').primary();
    t.integer('request_id').unsigned().references('requests.id').onDelete('CASCADE');
    t.integer('approver_id').unsigned().references('users.id');
    t.tinyint('level');
    t.enum('action', ['Approve','Reject','Send Back']);
    t.text('comments');
    t.dateTime('timestamp');
  });

  await knex.schema.createTable('audit_logs', (t) => {
    t.increments('id').primary();
    t.integer('request_id').unsigned().references('requests.id').onDelete('CASCADE');
    t.string('action', 255);
    t.integer('performed_by').unsigned().references('users.id');
    t.dateTime('timestamp');
  });

  await knex.schema.createTable('cost_centers', (t) => {
    t.increments('id').primary();
    t.string('n3_code', 50);
    t.string('description', 255);
    t.string('cost_center', 50);
    t.string('hod_name', 255);
  });

  await knex.schema.createTable('settings', (t) => {
    t.increments('id').primary();
    t.string('key').unique();
    t.string('value');
  });
};

/** @param { import('knex').Knex } knex */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('cost_centers');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('approvals');
  await knex.schema.dropTableIfExists('requests');
  await knex.schema.dropTableIfExists('users');
};
