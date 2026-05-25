const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const applicationsApi = (service, validator) => {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const payload = {
        jobId: req.body.jobId || req.body.job_id
      };

      validator.validateApplicationPayload(payload);
      const { id: userId } = req.user; 
      const applicationId = await service.addApplication(userId, payload.jobId);

      res.status(201).json({
        status: 'success',
        data: {
          id: applicationId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const applications = await service.getApplications();
      res.status(200).json({ status: 'success', data: { applications } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await service.getApplicationById(id);
      res.status(200).json({
        status: 'success',
        data: {
          ...application
        }
      });
  } catch (error) { next(error); }
});

  router.get('/user/:userId', authMiddleware, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const applications = await service.getApplicationsByUserId(userId);
      res.status(200).json({ status: 'success', data: { applications } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/job/:jobId', authMiddleware, async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const applications = await service.getApplicationsByJobId(jobId);
      res.status(200).json({ status: 'success', data: { applications } });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      validator.validateApplicationStatusPayload(req.body);
      const { id } = req.params;
      const { status } = req.body;
      
      await service.editApplicationStatusById(id, status);
      res.status(200).json({ status: 'success', message: 'Status lamaran berhasil diperbarui' });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.deleteApplicationById(id);
      res.status(200).json({ status: 'success', message: 'Lamaran berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = applicationsApi;