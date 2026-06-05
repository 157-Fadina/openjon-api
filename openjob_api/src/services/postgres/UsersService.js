const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ name, email, password }) {
    await this.verifyNewEmail(email);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, name, email, password) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, email, hashedPassword],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) throw new InvariantError('User gagal ditambahkan');
    return result.rows[0].id;
  }

  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Email sudah digunakan.');
    }
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new AuthenticationError('Kredensial yang Anda berikan salah');
    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) throw new AuthenticationError('Kredensial yang Anda berikan salah');
    return id;
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, name, email FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('User tidak ditemukan');
    return result.rows[0];
  }

  async getUsers() {
    const result = await this._pool.query('SELECT id, name, email, role FROM users');
    return result.rows;
  }
}

module.exports = UsersService;