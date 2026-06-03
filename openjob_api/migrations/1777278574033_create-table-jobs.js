/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'cascade', 
    },
    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"categories"',
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
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};