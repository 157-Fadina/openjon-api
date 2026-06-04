const express = require('express');

const usersApi = (service, validator) => {
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

  router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await service.getUserById(id);

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name || user.fullname,
        fullname: user.fullname || user.name,
        email: user.email || user.username,
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

  return router;
};

module.exports = usersApi;