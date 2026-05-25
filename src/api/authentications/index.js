const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const authenticationsApi = (authenticationsService, usersService, tokenManager, validator) => {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
  try {
    validator.validatePostAuthenticationPayload(req.body);
    const { email, password } = req.body; 
    const id = await usersService.verifyUserCredential(email, password);

      const accessToken = tokenManager.generateAccessToken({ id });
      const refreshToken = tokenManager.generateRefreshToken({ id });

      await authenticationsService.addRefreshToken(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/', async (req, res, next) => {
    try {
      validator.validatePutAuthenticationPayload(req.body);

      const { refreshToken } = req.body;
      
      await authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = tokenManager.generateAccessToken({ id });

      res.status(200).json({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/', authMiddleware, async (req, res, next) => {
    try {
      validator.validateDeleteAuthenticationPayload(req.body);

      const { refreshToken } = req.body;
      
      await authenticationsService.verifyRefreshToken(refreshToken);
      await authenticationsService.deleteRefreshToken(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = authenticationsApi;