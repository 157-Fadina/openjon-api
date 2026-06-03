const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const ApplicationPayloadSchema = Joi.object({
  jobId: Joi.string().required(),
});

const ApplicationStatusPayloadSchema = Joi.object({
  status: Joi.string().required(), 
});

module.exports = { UserPayloadSchema };
module.exports = { ApplicationPayloadSchema, ApplicationStatusPayloadSchema };

