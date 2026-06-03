const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ApplicationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addApplication(userId, jobId) {
    const jobCheck = await this._pool.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (!jobCheck.rowCount) {
      throw new NotFoundError('Pekerjaan tidak ditemukan');
    }

    const id = `application-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO applications (id, user_id, job_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, jobId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal melamar pekerjaan');
    }

    return result.rows[0].id;
  }

  async getApplicationsByUser(userId) {
    const query = {
      text: `SELECT applications.id, applications.job_id, jobs.title, companies.name AS company_name 
             FROM applications 
             JOIN jobs ON applications.job_id = jobs.id 
             LEFT JOIN companies ON jobs.company_id = companies.id 
             WHERE applications.user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getApplications() {
    const result = await this._pool.query('SELECT id, user_id, job_id, status FROM applications');
    return result.rows;
  }

  async getApplicationById(id) {
    const query = {
      text: 'SELECT * FROM applications WHERE id = $1', 
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lamaran tidak ditemukan');
    }
    return result.rows[0];
  }

  async getApplicationsByUserId(userId) {
    const query = {
      text: 'SELECT id, user_id, job_id, status FROM applications WHERE user_id = $1',
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getApplicationsByJobId(jobId) {
    const query = {
      text: 'SELECT id, user_id, job_id, status FROM applications WHERE job_id = $1',
      values: [jobId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async editApplicationStatusById(id, status) {
    const query = {
      text: 'UPDATE applications SET status = $1 WHERE id = $2 RETURNING id',
      values: [status, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui status lamaran. Id tidak ditemukan');
    }
  }

  async deleteApplicationById(id) {
    const query = {
      text: 'DELETE FROM applications WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lamaran gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = ApplicationsService;