const TokenManager = require('../tokenize/TokenManager');
const AuthenticationError = require('../exceptions/AuthenticationError');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Akses ditolak. Token tidak ditemukan atau format salah.');
    }

    const token = authHeader.split(' ')[1];
    const decodedPayload = TokenManager.verifyAccessToken(token);

    req.user = decodedPayload;
    next();
  } 
  catch (error) {
    next(error); 
  }
};

module.exports = authMiddleware;