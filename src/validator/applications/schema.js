const Joi = require('joi');

const ApplicationPayloadSchema = Joi.object({
  jobId: Joi.string().required(),
});

const ApplicationStatusPayloadSchema = Joi.object({
  status: Joi.string().required(), 
});

module.exports = { ApplicationPayloadSchema, ApplicationStatusPayloadSchema };