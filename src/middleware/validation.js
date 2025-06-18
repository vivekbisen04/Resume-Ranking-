const Joi = require('joi');

const validateRankingRequest = (req, res, next) => {
  const schema = Joi.object({
    jobDescription: Joi.string().min(50).max(5000).required(),
    resumes: Joi.alternatives().try(
      Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          content: Joi.string().required()
        })
      ),
      Joi.any() // For file uploads
    ),
    weights: Joi.object({
      skills: Joi.number().min(0).max(1),
      experience: Joi.number().min(0).max(1),
      education: Joi.number().min(0).max(1),
      keywords: Joi.number().min(0).max(1)
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateRankingRequest
};