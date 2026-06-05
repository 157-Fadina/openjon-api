const express = require('express');

const usersApi = (service, validator, cacheService) => {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    try {
      validator.validateUserPayload(req.body);
      const UserId = await service.addUser(req.body);

      res.status(201).json({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: { 
          addedUser: { id: UserId }, 
          userId: UserId,
          id: UserId
        },
      });
    } catch (error) {
      next(error);
    }
  });

  
  router.get('/', async (req, res, next) => {
    try {
      const users = await service.getUsers();
      res.status(200).json({
        status: 'success',
        data: {
          users: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;      
      try {
        const cachedData = await cacheService.get(`users:${id}`);
        const user = JSON.parse(cachedData);
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({ status: 'success', data: user });
      } catch (cacheError) {
        const user = await service.getUserById(id);        
        await cacheService.set(`users:${id}`, JSON.stringify(user), 3600);
        
        return res.status(200)
          .set('X-Data-Source', 'database')
          .json({ 
            status: 'success', 
            data: user 
          });
      }
    } catch (error) {
      next(error); 
    }
  });

  return router;
};

module.exports = usersApi;