exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('companies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'TEXT', notNull: true },
    description: { type: 'TEXT' },
    location: { type: 'TEXT' },
    owner_id: { 
      type: 'VARCHAR(50)', 
      notNull: true, 
      references: '"users"', 
      onDelete: 'cascade' 
    },
    created_at: { type: 'TEXT', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TEXT', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('companies');
};