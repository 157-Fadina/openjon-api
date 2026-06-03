const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class DocumentsService {
  constructor() {
    this._pool = new Pool();
  }

  async addDocument(fileName, path) {
    const id = `document-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO documents (id, file_name, path) VALUES($1, $2, $3) RETURNING id',
      values: [id, fileName, path],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan dokumen ke database');
    }

    return result.rows[0].id;
  }
}

module.exports = DocumentsService;