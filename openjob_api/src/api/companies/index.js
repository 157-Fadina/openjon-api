const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');

const companiesApi = (service, validator, cacheService) => { 
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      validator.validateCompanyPayload(req.body);
      const credentialId = req.user.id; 
      
      const companyId = await service.addCompany({
        ...req.body,
        ownerId: credentialId
      });

      

      res.status(201).json({
        status: 'success',
        message: 'Perusahaan berhasil ditambahkan',
        data: { 
          companyId: companyId,
          id: companyId,
          company: { id: companyId },
          addedCompany: { id: companyId } 
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const companies = await service.getCompanies();
      res.status(200).json({
        status: 'success',
        data: { companies },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const cacheKey = `companies:${id}`;

      try {
        const cachedData = await cacheService.get(cacheKey);
        const company = JSON.parse(cachedData);
        
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: {
              id: company.id,
              name: company.name,
              description: company.description,
              location: company.location,
              company: company
            }
          });
      } catch (error) {
        const company = await service.getCompanyById(id);        
        await cacheService.set(cacheKey, JSON.stringify(company), 3600);

        return res.status(200)
        .set('X-Data-Source', 'database') 
        .json({
          status: 'success',
          data: {
            id: company.id,
            name: company.name,
            description: company.description,
            location: company.location,
            company: company
          }
        });
      }
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.getCompanyById(id); 
      validator.validateCompanyPayload(req.body); 
      await service.editCompanyById(id, req.body);
      await cacheService.delete(`companies:${id}`);
      await cacheService.delete('companies');

      res.status(200).json({
        status: 'success',
        message: 'Perusahaan berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.deleteCompanyById(id);
      await cacheService.delete(`companies:${id}`);
      await cacheService.delete('companies');

      res.status(200).json({
        status: 'success',
        message: 'Perusahaan berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = companiesApi;