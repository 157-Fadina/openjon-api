const Joi = require('joi');

const JobPayloadSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  companyId: Joi.string().guid().optional(),
  categoryId: Joi.string().guid().optional()
}).unknown(true);

module.exports = { JobPayloadSchema };