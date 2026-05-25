const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const bookmarksApi = (service) => {
  const router = express.Router();

  router.post('/:jobId/bookmark', authMiddleware, async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { id: userId } = req.user; 
      const bookmarkId = await service.addBookmark(userId, jobId);

      res.status(201).json({
        status: 'success',
        message: 'Berhasil menambahkan bookmark',
        data: { bookmarkId: bookmarkId, id: bookmarkId }, 
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:jobId/bookmark/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookmark = await service.getBookmarkById(id);
      res.status(200).json({
        status: 'success',
        data: {
          ...bookmark
        }
      });
  } catch (error) { next(error); }
});

  router.delete('/:jobId/bookmark', authMiddleware, async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { id: userId } = req.user; 

      await service.deleteBookmarkByJobId(userId, jobId);

      res.status(200).json({
        status: 'success',
        message: 'Bookmark berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const bookmarks = await service.getBookmarksByUserId(userId);

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

module.exports = bookmarksApi;