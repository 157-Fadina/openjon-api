const Joi = require('joi');

const JobPayloadSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  salary: Joi.number().integer().optional(),
  location: Joi.string().optional(),
  requirements: Joi.string().optional(),
  jobType: Joi.string().optional(),
  companyId: Joi.string().guid().optional(),
  categoryId: Joi.string().guid().optional(),
}).unknown(true);

module.exports = { JobPayloadSchema };