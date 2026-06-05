const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError'); 

class BookmarksService {
  constructor() {
    this._pool = new Pool();
  }

  async addBookmark(userId, jobId) {
    const id = `bookmark-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO bookmarks (id, user_id, job_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, jobId],
    };

    try {
      const result = await this._pool.query(query);
      
      if (!result.rows[0].id) {
        throw new InvariantError('Gagal menyimpan pekerjaan');
      }
      return result.rows[0].id;
    } catch (error) {
      if (error.constraint === 'unique_user_id_and_job_id') {
        throw new InvariantError('Pekerjaan ini sudah Anda simpan sebelumnya');
      }
      throw new InvariantError('Gagal menyimpan pekerjaan. Pastikan ID pekerjaan valid.');
    }
  }

  async getBookmarksByUserId(userId) {
    const query = {
      text: `
        SELECT 
          bookmarks.id, 
          bookmarks.user_id, 
          bookmarks.job_id, 
          bookmarks.created_at AS "bookmarkCreatedAt", 
          bookmarks.updated_at AS "bookmarkUpdatedAt",
          
          jobs.title, 
          jobs.description, 
          jobs.salary, 
          jobs.location, 
          jobs.requirements, 
          jobs.job_type AS "jobType",
          jobs.company_id,
          jobs.category_id,
          jobs.created_at AS "createdAt",
          jobs.updated_at AS "updatedAt",
          
          companies.name AS "companyName",
          companies.location AS "companyLocation",
          categories.name AS "categoryName"
          
        FROM bookmarks
        LEFT JOIN jobs ON bookmarks.job_id = jobs.id
        LEFT JOIN companies ON jobs.company_id = companies.id
        LEFT JOIN categories ON jobs.category_id = categories.id
        WHERE bookmarks.user_id = $1
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getBookmarkById(id) {
    const query = {
      text: 'SELECT * FROM bookmarks WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Bookmark tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteBookmarkByJobId(userId, jobId) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING id',
      values: [userId, jobId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus bookmark. Id tidak ditemukan');
    }
  }
}

module.exports = BookmarksService;