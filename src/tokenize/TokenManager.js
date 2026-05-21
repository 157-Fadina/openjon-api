const Jwt = require('jsonwebtoken');
const InvariantError = require('../exceptions/InvariantError');
const AuthenticationError = require('../exceptions/AuthenticationError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' }),
  generateRefreshToken: (payload) => Jwt.sign(payload, process.env.REFRESH_TOKEN_KEY),
  
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return artifacts;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },

  verifyAccessToken: (accessToken) => {
    try {
      const artifacts = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
      return artifacts;
    } catch (error) {
      throw new AuthenticationError('Token akses tidak valid atau sudah kedaluwarsa');
    }
  },
};

module.exports = TokenManager;