const ClientError = require('../exceptions/ClientError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError || err.statusCode) {
    return res.status(err.statusCode || 400).json({
      status: 'failed', 
      message: err.message,
    });
  }

  console.error(err); 
  return res.status(500).json({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
};

module.exports = errorHandler;