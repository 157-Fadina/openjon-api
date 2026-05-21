const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CompaniesService {
  constructor() {
    this._pool = new Pool();
  }

  async addCompany({ name, description, location }) {
    const id = `company-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO companies (id, name, description, location) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, description, location],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Perusahaan gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getCompanies() {
    const result = await this._pool.query('SELECT id, name, description, location FROM companies');
    return result.rows;
  }

  async getCompanyById(id) {
    const query = {
      text: 'SELECT id, name, description, location FROM companies WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Perusahaan tidak ditemukan');
    }
    return result.rows[0];
  }

  async editCompanyById(id, { name, description, location }) {
    const query = {
      text: 'UPDATE companies SET name = $1, description = $2, location = $3 WHERE id = $4 RETURNING id',
      values: [name, description, location, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui perusahaan. Id tidak ditemukan');
    }
  }

  async deleteCompanyById(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Perusahaan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = CompaniesService;