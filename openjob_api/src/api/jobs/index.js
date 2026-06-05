const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const jobsApi = (service, validator) => {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      validator.validateJobPayload(req.body);

      req.body.companyId = req.body.companyId || req.body.company_id;
      req.body.categoryId = req.body.categoryId || req.body.category_id;

      const jobId = await service.addJob(req.body);

      res.status(201).json({
        status: 'success',
        message: 'Pekerjaan berhasil ditambahkan',
        data: {
          jobId: jobId,
          id: jobId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const { title, 'company-name': companyName } = req.query;
      const jobs = await service.getJobs(title, companyName);

      res.status(200).json({
        status: 'success',
        data: { jobs }
      });
    } catch (error) { next(error); }
  });

  router.get('/company/:companyId', async (req, res, next) => {
    try {
      const jobs = await service.getJobsByCompanyId(req.params.companyId);
      res.status(200).json({ status: 'success', data: { jobs } });
    } catch (error) { next(error); }
  });

  router.get('/category/:categoryId', async (req, res, next) => {
    try {
      const jobs = await service.getJobsByCategoryId(req.params.categoryId);
      res.status(200).json({ status: 'success', data: { jobs } });
    } catch (error) { next(error); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const job = await service.getJobById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: job
      });
    } catch (error) { next(error); }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      validator.validateJobPayload(req.body);
      await service.getJobById(req.params.id);
      
      req.body.companyId = req.body.companyId || req.body.company_id;
      req.body.categoryId = req.body.categoryId || req.body.category_id;
      
      await service.editJobById(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Pekerjaan berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      await service.getJobById(req.params.id);
      await service.deleteJobById(req.params.id);
      res.status(200).json({ status: 'success', message: 'Pekerjaan berhasil dihapus' });
    } catch (error) { next(error); }
  });

  return router;
};

module.exports = jobsApi;