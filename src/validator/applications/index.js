const InvariantError = require('../../exceptions/InvariantError');
const { ApplicationPayloadSchema, ApplicationStatusPayloadSchema } = require('./schema');

const ApplicationsValidator = {
  validateApplicationPayload: (payload) => {
    const validationResult = ApplicationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validateApplicationStatusPayload: (payload) => {
    const validationResult = ApplicationStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  }
};

module.exports = ApplicationsValidator;