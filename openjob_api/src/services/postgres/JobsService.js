const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class JobsService {
  constructor() { this._pool = new Pool(); }

  async addJob(payload) {
    const id = `job-${nanoid(16)}`;
    const cId = payload.companyId || payload.company_id;
    const catId = payload.categoryId || payload.category_id;
    
    const query = {
      text: 'INSERT INTO jobs (id, title, description, company_id, category_id, salary, location, requirements, job_type) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id, payload.title, payload.description, cId, catId, 
        payload.salary, payload.location, payload.requirements, payload.jobType || payload.job_type
      ]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new InvariantError('Gagal menambahkan pekerjaan');
    return result.rows[0].id;
  }

  async getJobs(title, companyName) {
    let queryText = `
      SELECT 
        jobs.id, jobs.title, jobs.description, 
        jobs.salary, jobs.location, jobs.requirements, jobs.job_type AS "jobType",
        jobs.company_id, jobs.category_id,
        jobs.created_at AS "createdAt", jobs.updated_at AS "updatedAt",
        companies.name AS "companyName",
        categories.name AS "categoryName"
      FROM jobs 
      LEFT JOIN companies ON jobs.company_id = companies.id
      LEFT JOIN categories ON jobs.category_id = categories.id
      WHERE 1=1`;
      
    const queryValues = [];
    let parameterIndex = 1;

    if (title) {
      queryText += ` AND jobs.title ILIKE $${parameterIndex}`;
      queryValues.push(`%${title}%`);
      parameterIndex++;
    }

    if (companyName) {
      queryText += ` AND companies.name ILIKE $${parameterIndex}`;
      queryValues.push(`%${companyName}%`);
      parameterIndex++;
    }

    const result = await this._pool.query({ text: queryText, values: queryValues });
    return result.rows;
  }

  async getJobById(id) {
    const queryText = `
      SELECT 
        jobs.id, jobs.title, jobs.description, 
        jobs.salary, jobs.location, jobs.requirements, jobs.job_type AS "jobType",
        jobs.company_id, jobs.category_id,
        jobs.created_at AS "createdAt", jobs.updated_at AS "updatedAt",
        companies.name AS "companyName",
        categories.name AS "categoryName"
      FROM jobs 
      LEFT JOIN companies ON jobs.company_id = companies.id
      LEFT JOIN categories ON jobs.category_id = categories.id
      WHERE jobs.id = $1`;
      
    const result = await this._pool.query({ text: queryText, values: [id] });
    if (!result.rows.length) throw new NotFoundError('Pekerjaan tidak ditemukan');
    return result.rows[0];
  }

  async getJobsByCompanyId(companyId) {
    const queryText = `
      SELECT 
        jobs.id, jobs.title, jobs.description, 
        jobs.salary, jobs.location, jobs.requirements, jobs.job_type AS "jobType",
        jobs.company_id, jobs.category_id,
        jobs.created_at AS "createdAt", jobs.updated_at AS "updatedAt",
        companies.name AS "companyName",
        categories.name AS "categoryName"
      FROM jobs 
      LEFT JOIN companies ON jobs.company_id = companies.id
      LEFT JOIN categories ON jobs.category_id = categories.id
      WHERE jobs.company_id = $1`;
    return (await this._pool.query({ text: queryText, values: [companyId] })).rows;
  }

  async getJobsByCategoryId(categoryId) {
    const queryText = `
      SELECT 
        jobs.id, jobs.title, jobs.description, 
        jobs.salary, jobs.location, jobs.requirements, jobs.job_type AS "jobType",
        jobs.company_id, jobs.category_id,
        jobs.created_at AS "createdAt", jobs.updated_at AS "updatedAt",
        companies.name AS "companyName",
        categories.name AS "categoryName"
      FROM jobs 
      LEFT JOIN companies ON jobs.company_id = companies.id
      LEFT JOIN categories ON jobs.category_id = categories.id
      WHERE jobs.category_id = $1`;
    return (await this._pool.query({ text: queryText, values: [categoryId] })).rows;
  }

  async editJobById(id, payload) {
    const oldData = await this.getJobById(id);
    const title = payload.title || oldData.title;
    const description = payload.description || oldData.description;    
    const cId = payload.companyId || payload.company_id || oldData.company_id;
    const catId = payload.categoryId || payload.category_id || oldData.category_id;
    const salary = payload.salary || oldData.salary;
    const location = payload.location || oldData.location;
    const requirements = payload.requirements || oldData.requirements;
    const jobType = payload.jobType || payload.job_type || oldData.jobType || oldData.job_type;

    const query = {
      text: 'UPDATE jobs SET title = $1, description = $2, company_id = $3, category_id = $4, salary = $5, location = $6, requirements = $7, job_type = $8 WHERE id = $9 RETURNING id',
      values: [title, description, cId, catId, salary, location, requirements, jobType, id]
    };
    
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui');
  }

  async deleteJobById(id) {
    const result = await this._pool.query({ text: 'DELETE FROM jobs WHERE id = $1 RETURNING id', values: [id] });
    if (!result.rows.length) throw new NotFoundError('Gagal dihapus');
  }
}

module.exports = JobsService;