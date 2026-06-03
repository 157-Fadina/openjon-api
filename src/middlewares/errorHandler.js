const ClientError = require('../exceptions/ClientError');

const errorHandler = (err, req, res, next) => {
  // 1. Tangkap ClientError custom ATAU error bawaan Express 
  // (seperti body JSON yang rusak/typo) yang memiliki statusCode 400
  if (err instanceof ClientError || err.statusCode) {
    return res.status(err.statusCode || 400).json({
      status: 'failed', // WAJIB menggunakan 'failed' untuk lolos uji Postman
      message: err.message,
    });
  }

  // 2. Jika benar-benar error sistem dari dalam kode, kembalikan 500
  console.error(err); 
  return res.status(500).json({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
};

module.exports = errorHandler;