const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const applicationsApi = (service, validator, cacheService, producerService) => {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { job_id } = req.body;
    const { id: userId } = req.user;

    const payload = { jobId: job_id };
    validator.validateApplicationPayload(payload);

    const applicationId = await service.addApplication(userId, job_id);

    await cacheService.delete(`applications:user:${userId}`);
    await cacheService.delete(`applications:job:${job_id}`);
    
    const message = JSON.stringify({ application_id: applicationId });
    await producerService.sendMessage('job_applications', message);

    res.status(201).json({status: 'success',data: {id: applicationId,user_id: userId, job_id,status: 'pending'}});
  } catch (error) { next(error); }
});

  router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const cacheKey = `applications:${id}`;
      try {
        const cachedData = await cacheService.get(cacheKey);
        return res.status(200).set('X-Data-Source', 'cache').json({ status: 'success', data: { ...JSON.parse(cachedData) } });
      } catch (error) {
        const application = await service.getApplicationById(id);
        await cacheService.set(cacheKey, JSON.stringify(application), 3600);
        res.status(200).set('X-Data-Source', 'database').json({status: 'success',data: { ...application }});
      }
    } catch (error) { next(error); }
  });

  router.get('/user/:userId', authMiddleware, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const cacheKey = `applications:user:${userId}`;
      try {
        const cachedData = await cacheService.get(cacheKey);
        return res.status(200).set('X-Data-Source', 'cache').json({ status: 'success', data: { applications: JSON.parse(cachedData) } });
      } catch (error) {
        const applications = await service.getApplicationsByUserId(userId);
        await cacheService.set(cacheKey, JSON.stringify(applications), 3600);
        res.status(200).set('X-Data-Source', 'database').json({status: 'success',data: { applications }});
      }
    } catch (error) { next(error); }
  });

  router.get('/job/:jobId', authMiddleware, async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const cacheKey = `applications:job:${jobId}`;
      try {
        const cachedData = await cacheService.get(cacheKey);
        return res.status(200).set('X-Data-Source', 'cache').json({ status: 'success', data: { applications: JSON.parse(cachedData) } });
      } catch (error) {
        const applications = await service.getApplicationsByJobId(jobId);
        await cacheService.set(cacheKey, JSON.stringify(applications), 3600);
        res.status(200).set('X-Data-Source', 'database').json({ status: 'success', data: { applications } });
      }
    } catch (error) { next(error); }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      validator.validateApplicationStatusPayload(req.body);
      const { id } = req.params;
      const { status } = req.body;
      
      const application = await service.getApplicationById(id);
      await service.editApplicationStatusById(id, status);
      
      await cacheService.delete(`applications:${id}`);
      await cacheService.delete(`applications:user:${application.user_id}`);
      await cacheService.delete(`applications:job:${application.job_id}`);

      res.status(200).json({ status: 'success', message: 'Status lamaran berhasil diperbarui' });
    } catch (error) { next(error); }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const application = await service.getApplicationById(id);
      await service.deleteApplicationById(id);
      
      await cacheService.delete(`applications:${id}`);
      await cacheService.delete(`applications:user:${application.user_id}`);
      await cacheService.delete(`applications:job:${application.job_id}`);

      res.status(200).json({ status: 'success', message: 'Lamaran berhasil dihapus' });
    } catch (error) { next(error); }
  });

  return router;
};

module.exports = applicationsApi;