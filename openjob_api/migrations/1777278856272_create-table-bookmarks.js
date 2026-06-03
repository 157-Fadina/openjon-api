exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"jobs"',
      onDelete: 'cascade',
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

  pgm.addConstraint('bookmarks', 'unique_user_id_and_job_id', {
    unique: ['user_id', 'job_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('bookmarks');
};