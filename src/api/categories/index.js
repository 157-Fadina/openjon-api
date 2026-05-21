const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const categoriesApi = (service, validator) => {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      validator.validateCategoryPayload(req.body);
      const categoryId = await service.addCategory(req.body);

      res.status(201).json({
        status: 'success',
        message: 'Kategori berhasil ditambahkan',
        data: { 
          categoryId: categoryId,
          id: categoryId,
          category: { id: categoryId },
          addedCategory: { id: categoryId }
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const categories = await service.getCategories();
      res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await service.getCategoryById(id);

      res.status(200).json({
        status: 'success',
        data: {
          id: category.id,
          name: category.name,
          category: category
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      validator.validateCategoryPayload(req.body);
      const { id } = req.params;
      await service.editCategoryById(id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Kategori berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.deleteCategoryById(id);

      res.status(200).json({
        status: 'success',
        message: 'Kategori berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = categoriesApi;