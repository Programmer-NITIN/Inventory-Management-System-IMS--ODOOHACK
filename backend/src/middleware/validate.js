const AppError = require('../utils/AppError');

/**
 * Middleware factory: Validate request body against a Joi schema.
 * @param {import('joi').Schema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map(d => d.message).join('; ');
      return next(new AppError(message, 400, 'VALIDATION_ERROR'));
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
