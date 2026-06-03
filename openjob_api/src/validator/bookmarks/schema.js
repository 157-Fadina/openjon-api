const Joi = require('joi');

const BookmarkPayloadSchema = Joi.object({
  jobId: Joi.string().required(),
});

module.exports = { BookmarkPayloadSchema };