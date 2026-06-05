const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const profileApi = (usersService, applicationsService, bookmarksService) => {
  const router = express.Router();

  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const [user, bookmarks, applications] = await Promise.all([
        usersService.getUserById(userId),
        bookmarksService.getBookmarksByUserId(userId),
        applicationsService.getApplicationsByUserId(userId)
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          bookmarks,
          applications
        }
      });
    } catch (error) { 
      next(error); 
    }
  });

  router.get('/applications', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const applications = await applicationsService.getApplicationsByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/bookmarks', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const bookmarks = await bookmarksService.getBookmarksByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = profileApi;