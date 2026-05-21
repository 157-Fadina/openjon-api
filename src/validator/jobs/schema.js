const Joi = require('joi');

const JobPayloadSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
}).unknown(true);

module.exports = { JobPayloadSchema };