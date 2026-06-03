exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    file_name: {
      type: 'TEXT',
      notNull: true,
    },
    path: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};