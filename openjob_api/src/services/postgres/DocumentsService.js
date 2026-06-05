const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

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

  async getDocuments() {
  const query = {
    text: 'SELECT id, file_name, path FROM documents',
  };

  const result = await this._pool.query(query);

  return result.rows;
}

  async getDocumentById(id) {
    const query = {
      text: 'SELECT id, file_name, path FROM documents WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen tidak ditemukan'); 
    }

    return result.rows[0];
  }

  async deleteDocumentById(id) {
    const query = {
      text: 'DELETE FROM documents WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen tidak ditemukan');
    }
  }
}

module.exports = DocumentsService;